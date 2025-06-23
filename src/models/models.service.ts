import { ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Owner, PaginationInput, SelectionInput } from '@nestjs!/graphql-filter';

import * as bcrypt from 'bcryptjs';
import { Equal, FindOptionsOrder, FindOptionsRelations, FindOptionsWhere, Not, Repository } from 'typeorm';

import { Model, ModelCreateInput, ModelUpdateInput } from './entities/model.entity';
import { MetaModel } from 'src/meta-models/entities/meta-model.entity';
import { Role, User } from 'src/users/entities/user.entity';

@Injectable()
export class ModelsService {
  constructor(
    @InjectRepository(Model)
    private modelsRepository: Repository<Model>,
    @InjectRepository(MetaModel)
    private metaModelsRepository: Repository<MetaModel>,
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}

  async create(modelCreateInput: ModelCreateInput, selection: SelectionInput, authUser: User) {
    // only admin can create models on other users
    if (modelCreateInput.owner.id != authUser.id && authUser.role != Role.ADMIN)
      throw new ForbiddenException('Cannot create models on users other than yourself.');

    // check if metamodel exists
    const existentMetaModel = await this.metaModelsRepository.findOne({
      where: { id: modelCreateInput.metaModel.id }
    });
    if (!existentMetaModel) throw new ConflictException('Metamodel not found.');

    // check if tagname already taken
    const existentTag = await this.modelsRepository.findOne({
      where: { tag: modelCreateInput.tag }
    });
    if (existentTag) throw new ConflictException('Tag already taken.');

    // insert model
    const insert = await this.modelsRepository.insert({
      ...modelCreateInput,
      owner: { id: modelCreateInput.owner.id },
      metaModel: { id: modelCreateInput.metaModel.id },
      version: '1.0.0'
    });

    return await this.modelsRepository.findOne({
      relations: selection?.getRelations(),
      where: { id: insert.identifiers[0].id }
    });
  }

  async update(modelUpdateInput: ModelUpdateInput, selection: SelectionInput, authUser: User) {
    // check if model exists
    const existent = await this.modelsRepository.findOne({
      where: { id: modelUpdateInput.id },
      relations: { owner: true }
    });
    if (!existent) throw new ConflictException('Model not found.');

    // only admin can update others models
    if (existent.owner.id != authUser.id && authUser.role != Role.ADMIN)
      throw new ForbiddenException('Cannot update models that are not of your own.');

    // check if tagname already taken
    if (modelUpdateInput.tag) {
      const existentTag = await this.modelsRepository.findOne({
        where: [{ id: Not(Equal(modelUpdateInput.id)), tag: modelUpdateInput.tag }]
      });
      if (existentTag) throw new ConflictException('Tag already taken.');
    }

    await this.modelsRepository.update({ id: modelUpdateInput.id }, modelUpdateInput);
    return await this.modelsRepository.findOne({
      relations: selection?.getRelations(),
      where: { id: modelUpdateInput.id }
    });
  }

  async delete(id: string, password: string, authUser: User) {
    // check if model exists
    const existent = await this.modelsRepository.findOne({
      where: { id: id },
      relations: { owner: true }
    });
    if (!existent) throw new ConflictException('Model not found.');

    // only admin can delete other models
    if (existent.owner.id != authUser.id && authUser.role != Role.ADMIN)
      throw new ForbiddenException('Cannot delete models that are not of your own.');

    // check the password: if user is not admin, check password of the owner of the model
    // if user is admin, check password of the authenticated user
    if (authUser.role != Role.ADMIN) {
      // check if owner exists
      const owner = await this.usersRepository.findOne({
        where: { id: existent.owner.id }
      });

      // check if password is correct
      const passwordMatch = await bcrypt.compare(password, owner.password);
      if (!passwordMatch) throw new ConflictException('Password is incorrect.');
    } else {
      // check if admin user exists
      const admin = await this.usersRepository.findOne({
        where: { id: authUser.id }
      });

      // check if password is correct
      const passwordMatch = await bcrypt.compare(password, admin.password);
      if (!passwordMatch) throw new ConflictException('Password is incorrect.');
    }

    // delete model
    this.modelsRepository.softDelete({ id: id });

    return id;
  }

  async checkTagExists(tag: string, model?: string) {
    const [set, count] = await this.modelsRepository.findAndCount({
      where: { ...(model ? { id: Not(Equal(model)) } : {}), tag: tag }
    });
    return count > 0;
  }

  async findOne(id: string, selection: SelectionInput | FindOptionsRelations<Model>, authUser: User) {
    return await this.modelsRepository.findOne({
      relations:
        typeof selection['getRelations'] === 'function' ? (selection as SelectionInput).getRelations() : selection,
      where: Owner({ id: id }, 'owner.id', authUser, [Role.ADMIN])
    });
  }

  async findMany(
    where: FindOptionsWhere<Model>,
    order: FindOptionsOrder<Model>,
    pagination: PaginationInput,
    selection: SelectionInput
  ) {
    const [set, count] = await this.modelsRepository.findAndCount({
      relations: selection?.getRelations(),
      where: where,
      order: order,
      skip: pagination ? (pagination.page - 1) * pagination.count : null,
      take: pagination ? pagination.count : null
    });
    return { set, count };
  }
}
