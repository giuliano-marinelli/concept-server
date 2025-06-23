import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import {
  AuthUser,
  PaginationInput,
  SelectionInput,
  SelectionSet,
  TypeORMOrderTransform,
  TypeORMWhereTransform
} from '@nestjs!/graphql-filter';

import { GraphQLUUID } from 'graphql-scalars';
import { Public } from 'src/auth/decorators/public.decorator';
import { Action } from 'src/casl/casl.factory';
import { CheckPolicies } from 'src/casl/decorators/check-policies.decorator';
import { FindOptionsOrder, FindOptionsWhere } from 'typeorm';

import {
  Model,
  ModelCreateInput,
  ModelOrderInput,
  ModelUpdateInput,
  ModelWhereInput,
  Models
} from './entities/model.entity';
import { User } from 'src/users/entities/user.entity';

import { ModelsService } from './models.service';

@Resolver(() => Model)
export class ModelsResolver {
  constructor(private readonly modelsService: ModelsService) {}

  @CheckPolicies((args) => ({
    action: Action.Create,
    subject: Model.name,
    fields: args.modelCreateInput
  }))
  @Mutation(() => Model, { name: 'createModel', nullable: true })
  async create(
    @Args('modelCreateInput') modelCreateInput: ModelCreateInput,
    @SelectionSet() selection: SelectionInput,
    @AuthUser() authUser: User
  ) {
    return await this.modelsService.create(modelCreateInput, selection, authUser);
  }

  @CheckPolicies((args) => ({
    action: Action.Update,
    subject: Model.name,
    fields: args.modelUpdateInput
  }))
  @Mutation(() => Model, { name: 'updateModel', nullable: true })
  async update(
    @Args('modelUpdateInput') modelUpdateInput: ModelUpdateInput,
    @SelectionSet() selection: SelectionInput,
    @AuthUser() authUser: User
  ) {
    return await this.modelsService.update(modelUpdateInput, selection, authUser);
  }

  @CheckPolicies(() => ({
    action: Action.Delete,
    subject: Model.name
  }))
  @Mutation(() => GraphQLUUID, { name: 'deleteModel' })
  async delete(
    @Args('id', { type: () => GraphQLUUID }) id: string,
    @Args('password') password: string,
    @AuthUser() authUser: User
  ) {
    return await this.modelsService.delete(id, password, authUser);
  }

  @Public()
  @CheckPolicies(() => ({
    action: Action.Read,
    subject: Model.name
  }))
  @Query(() => Boolean, { name: 'checkModelTagExists', nullable: true })
  async checkTagExists(
    @Args('tag') tag: string,
    @Args('model', { type: () => GraphQLUUID, nullable: true }) model: string
  ) {
    return await this.modelsService.checkTagExists(tag, model);
  }

  @Public()
  @CheckPolicies(() => ({
    action: Action.Read,
    subject: Model.name
  }))
  @Query(() => Model, { name: 'model', nullable: true })
  async findOne(
    @Args('id', { type: () => GraphQLUUID }) id: string,
    @SelectionSet() selection: SelectionInput,
    @AuthUser() authUser: User
  ) {
    return await this.modelsService.findOne(id, selection, authUser);
  }

  @Public()
  @CheckPolicies((args) => ({
    action: Action.Filter,
    subject: Model.name,
    fields: args.where
  }))
  @Query(() => Models, { name: 'models' })
  async findMany(
    @Args('where', { type: () => [ModelWhereInput], nullable: true }, TypeORMWhereTransform<Model>)
    where: FindOptionsWhere<Model>,
    @Args('order', { type: () => [ModelOrderInput], nullable: true }, TypeORMOrderTransform<Model>)
    order: FindOptionsOrder<Model>,
    @Args('pagination', { nullable: true }) pagination: PaginationInput,
    @SelectionSet({ root: 'set' }) selection: SelectionInput
  ) {
    return await this.modelsService.findMany(where, order, pagination, selection);
  }
}
