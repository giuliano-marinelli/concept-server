import { ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Owner, PaginationInput, SelectionInput } from '@nestjs!/graphql-filter';

import { Equal, FindOptionsOrder, FindOptionsRelations, FindOptionsWhere, Not, Repository } from 'typeorm';

import { Metamodel, MetamodelCreateInput, MetamodelUpdateInput } from './entities/metamodel.entity';
import { Role, User } from 'src/users/entities/user.entity';

@Injectable()
export class MetamodelsService {
  constructor(
    @InjectRepository(Metamodel)
    private metamodelsRepository: Repository<Metamodel>
  ) {}

  async create(metamodelCreateInput: MetamodelCreateInput, selection: SelectionInput, authUser: User) {
    // only admin can create metamodels on other users
    if (metamodelCreateInput.owner.id != authUser.id && authUser.role != Role.ADMIN)
      throw new ForbiddenException('Cannot create metamodels on users other than yourself.');

    // check if tagname already taken
    const existentTagname = await this.metamodelsRepository.findOne({
      where: { tagname: metamodelCreateInput.tagname }
    });
    if (existentTagname) throw new ConflictException('Tagname already taken.');

    // insert metamodel
    const insert = await this.metamodelsRepository.insert({
      ...metamodelCreateInput,
      owner: { id: metamodelCreateInput.owner.id },
      version: '1.0.0'
    });

    return await this.metamodelsRepository.findOne({
      relations: selection?.getRelations(),
      where: { id: insert.identifiers[0].id }
    });
  }

  async update(metamodelUpdateInput: MetamodelUpdateInput, selection: SelectionInput, authUser: User) {
    // only admin can update others metamodels
    if (metamodelUpdateInput.id != authUser.id && authUser.role != Role.ADMIN)
      throw new ForbiddenException('Cannot update metamodels that are not of your own.');

    // check if metamodel exists
    const existent = await this.metamodelsRepository.findOne({
      where: { id: metamodelUpdateInput.id }
    });
    if (!existent) throw new ConflictException('Metamodel not found.');

    // check if tagname already taken
    if (metamodelUpdateInput.tagname) {
      const existentTagname = await this.metamodelsRepository.findOne({
        where: [{ id: Not(Equal(metamodelUpdateInput.id)), tagname: metamodelUpdateInput.tagname }]
      });
      if (existentTagname) throw new ConflictException('Tagname already taken.');
    }

    await this.metamodelsRepository.update({ id: metamodelUpdateInput.id }, metamodelUpdateInput);
    return await this.metamodelsRepository.findOne({
      relations: selection?.getRelations(),
      where: { id: metamodelUpdateInput.id }
    });
  }

  async delete(id: string, password: string, authUser: User) {
    // only admin can delete other metamodels
    if (id != authUser.id && authUser.role != Role.ADMIN)
      throw new ForbiddenException('Cannot delete metamodels that are not of your own.');

    // check if metamodel exists
    const existent = await this.metamodelsRepository.findOne({
      where: { id: id }
    });
    if (!existent) throw new ConflictException('Metamodel not found.');

    // delete metamodel
    this.metamodelsRepository.softDelete({ id: id });

    return id;
  }

  async checkTagnameExists(tagname: string) {
    const [set, count] = await this.metamodelsRepository.findAndCount({
      where: { tagname: tagname }
    });
    return count > 0;
  }

  async findOne(id: string, selection: SelectionInput | FindOptionsRelations<Metamodel>, authUser: User) {
    return await this.metamodelsRepository.findOne({
      relations:
        typeof selection['getRelations'] === 'function' ? (selection as SelectionInput).getRelations() : selection,
      where: Owner({ id: id }, 'owner.id', authUser, [Role.ADMIN])
    });
  }

  async findMany(
    where: FindOptionsWhere<Metamodel>,
    order: FindOptionsOrder<Metamodel>,
    pagination: PaginationInput,
    selection: SelectionInput
  ) {
    const [set, count] = await this.metamodelsRepository.findAndCount({
      relations: selection?.getRelations(),
      where: where,
      order: order,
      skip: pagination ? (pagination.page - 1) * pagination.count : null,
      take: pagination ? pagination.count : null
    });
    return { set, count };
  }
}
