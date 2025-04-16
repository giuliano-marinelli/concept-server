import { ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Owner, PaginationInput, SelectionInput } from '@nestjs!/graphql-filter';

import * as bcrypt from 'bcryptjs';
import { Equal, FindOptionsOrder, FindOptionsRelations, FindOptionsWhere, Not, Repository } from 'typeorm';

import { MetaElement, MetaElementCreateInput, MetaElementUpdateInput } from './entities/meta-element.entity';
import { MetaModel, MetaModelCreateInput, MetaModelUpdateInput } from './entities/meta-model.entity';
import { Role, User } from 'src/users/entities/user.entity';

@Injectable()
export class MetaModelsService {
  constructor(
    @InjectRepository(MetaModel)
    private metaModelsRepository: Repository<MetaModel>,
    @InjectRepository(MetaElement)
    private metaElementsRepository: Repository<MetaElement>,
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}

  async create(metaModelCreateInput: MetaModelCreateInput, selection: SelectionInput, authUser: User) {
    // only admin can create metamodels on other users
    if (metaModelCreateInput.owner.id != authUser.id && authUser.role != Role.ADMIN)
      throw new ForbiddenException('Cannot create metamodels on users other than yourself.');

    // check if tagname already taken
    const existentTag = await this.metaModelsRepository.findOne({
      where: { tag: metaModelCreateInput.tag }
    });
    if (existentTag) throw new ConflictException('Tag already taken.');

    // insert metamodel
    const insert = await this.metaModelsRepository.insert({
      ...metaModelCreateInput,
      owner: { id: metaModelCreateInput.owner.id },
      version: '1.0.0'
    });

    return await this.metaModelsRepository.findOne({
      relations: selection?.getRelations(),
      where: { id: insert.identifiers[0].id }
    });
  }

  async update(metaModelUpdateInput: MetaModelUpdateInput, selection: SelectionInput, authUser: User) {
    // check if metamodel exists
    const existent = await this.metaModelsRepository.findOne({
      where: { id: metaModelUpdateInput.id },
      relations: { owner: true }
    });
    if (!existent) throw new ConflictException('Metamodel not found.');

    // only admin can update others metamodels
    if (existent.owner.id != authUser.id && authUser.role != Role.ADMIN)
      throw new ForbiddenException('Cannot update metamodels that are not of your own.');

    // check if tagname already taken
    if (metaModelUpdateInput.tag) {
      const existentTag = await this.metaModelsRepository.findOne({
        where: [{ id: Not(Equal(metaModelUpdateInput.id)), tag: metaModelUpdateInput.tag }]
      });
      if (existentTag) throw new ConflictException('Tag already taken.');
    }

    await this.metaModelsRepository.update({ id: metaModelUpdateInput.id }, metaModelUpdateInput);
    return await this.metaModelsRepository.findOne({
      relations: selection?.getRelations(),
      where: { id: metaModelUpdateInput.id }
    });
  }

  async delete(id: string, password: string, authUser: User) {
    // check if metamodel exists
    const existent = await this.metaModelsRepository.findOne({
      where: { id: id },
      relations: { owner: true }
    });
    if (!existent) throw new ConflictException('Metamodel not found.');

    // only admin can delete other metamodels
    if (existent.owner.id != authUser.id && authUser.role != Role.ADMIN)
      throw new ForbiddenException('Cannot delete metamodels that are not of your own.');

    // check the password: if user is not admin, check password of the owner of the metamodel
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

    // delete metamodel
    this.metaModelsRepository.softDelete({ id: id });

    return id;
  }

  async createMetaElement(metaElementCreateInput: MetaElementCreateInput, selection: SelectionInput, authUser: User) {
    // check if metamodel exists
    const existentMetaModel = await this.metaModelsRepository.findOne({
      where: { id: metaElementCreateInput.metaModel.id },
      relations: { owner: true }
    });
    if (!existentMetaModel) throw new ConflictException('Metamodel not found.');

    // only admin can create metaelements on other users metamodels
    if (existentMetaModel.owner.id != authUser.id && authUser.role != Role.ADMIN)
      throw new ForbiddenException('Cannot create metaelements on metamodels own by users other than yourself.');

    // check if tagname already taken
    const existentTag = await this.metaElementsRepository.findOne({
      where: { tag: metaElementCreateInput.tag, metaModel: { id: metaElementCreateInput.metaModel.id } }
    });
    if (existentTag) throw new ConflictException('Tag already taken.');

    // check GModel schema and AModel schema
    // TODO

    // insert metaelement
    const insert = await this.metaElementsRepository.insert({
      ...metaElementCreateInput,
      metaModel: { id: metaElementCreateInput.metaModel.id }
    });

    return await this.metaElementsRepository.findOne({
      relations: selection?.getRelations(),
      where: { id: insert.identifiers[0].id }
    });
  }

  async updateMetaElement(metaElementUpdateInput: MetaElementUpdateInput, selection: SelectionInput, authUser: User) {
    // check if metaelement exists
    const existent = await this.metaElementsRepository.findOne({
      where: { id: metaElementUpdateInput.id },
      relations: { metaModel: { owner: true } }
    });
    if (!existent) throw new ConflictException('Metaelement not found.');

    // only admin can update metaelements on other users metamodels
    if (existent.metaModel.owner.id != authUser.id && authUser.role != Role.ADMIN)
      throw new ForbiddenException('Cannot update metaelements on metamodels own by users other than yourself.');

    // check if tagname already taken
    if (metaElementUpdateInput.tag) {
      const existentTag = await this.metaElementsRepository.findOne({
        where: [
          {
            id: Not(Equal(metaElementUpdateInput.id)),
            tag: metaElementUpdateInput.tag,
            metaModel: { id: existent.metaModel.id }
          }
        ]
      });
      if (existentTag) throw new ConflictException('Tag already taken.');
    }

    // check GModel schema and AModel schema
    // TODO

    // update metaelement
    await this.metaElementsRepository.update({ id: metaElementUpdateInput.id }, metaElementUpdateInput);

    return await this.metaElementsRepository.findOne({
      relations: selection?.getRelations(),
      where: { id: metaElementUpdateInput.id }
    });
  }

  async deleteMetaElement(id: string, authUser: User) {
    // check if metaelement exists
    const existent = await this.metaElementsRepository.findOne({
      where: { id: id },
      relations: { metaModel: { owner: true } }
    });
    if (!existent) throw new ConflictException('Metaelement not found.');

    // only admin can delete metaelements on other users metamodels
    if (existent.metaModel.owner.id != authUser.id && authUser.role != Role.ADMIN)
      throw new ForbiddenException('Cannot delete metaelements on metamodels own by users other than yourself.');

    // delete metaelement
    this.metaElementsRepository.softDelete({ id: id });

    return id;
  }

  async checkTagExists(tag: string, metaModel?: string) {
    const [set, count] = await this.metaModelsRepository.findAndCount({
      where: { ...(metaModel ? { id: Not(Equal(metaModel)) } : {}), tag: tag }
    });
    return count > 0;
  }

  async checkMetaElementTagExists(tag: string, metaModel: string, metaElement?: string) {
    const [set, count] = await this.metaElementsRepository.findAndCount({
      where: { metaModel: { id: metaModel }, ...(metaElement ? { id: Not(Equal(metaElement)) } : {}), tag: tag }
    });
    return count > 0;
  }

  async findOne(id: string, selection: SelectionInput | FindOptionsRelations<MetaModel>, authUser: User) {
    return await this.metaModelsRepository.findOne({
      relations:
        typeof selection['getRelations'] === 'function' ? (selection as SelectionInput).getRelations() : selection,
      where: Owner({ id: id }, 'owner.id', authUser, [Role.ADMIN])
    });
  }

  async findMany(
    where: FindOptionsWhere<MetaModel>,
    order: FindOptionsOrder<MetaModel>,
    pagination: PaginationInput,
    selection: SelectionInput
  ) {
    const [set, count] = await this.metaModelsRepository.findAndCount({
      relations: selection?.getRelations(),
      where: where,
      order: order,
      skip: pagination ? (pagination.page - 1) * pagination.count : null,
      take: pagination ? pagination.count : null
    });
    return { set, count };
  }
}
