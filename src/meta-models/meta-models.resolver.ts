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
import { GraphQLUpload } from 'graphql-upload-ts';
import { Public } from 'src/auth/decorators/public.decorator';
import { Action } from 'src/casl/casl.factory';
import { CheckPolicies } from 'src/casl/decorators/check-policies.decorator';
import { UploadTransform } from 'src/pipes/upload.pipe';
import { FindOptionsOrder, FindOptionsWhere } from 'typeorm';

import { MetaElement, MetaElementCreateInput, MetaElementUpdateInput } from './entities/meta-element.entity';
import {
  MetaModel,
  MetaModelCreateInput,
  MetaModelOrderInput,
  MetaModelUpdateInput,
  MetaModelWhereInput,
  MetaModels
} from './entities/meta-model.entity';
import { User } from 'src/users/entities/user.entity';

import { MetaModelsService } from './meta-models.service';

@Resolver(() => MetaModel)
export class MetaModelsResolver {
  constructor(private readonly metaModelsService: MetaModelsService) {}

  @Public()
  @CheckPolicies((args) => ({
    action: Action.Create,
    subject: MetaModel.name,
    fields: args.metamodelCreateInput
  }))
  @Mutation(() => MetaModel, { name: 'createMetaModel', nullable: true })
  async create(
    @Args('metaModelCreateInput') metaModelCreateInput: MetaModelCreateInput,
    @Args('logoFile', { type: () => GraphQLUpload, nullable: true }, UploadTransform) logo: string,
    @SelectionSet() selection: SelectionInput,
    @AuthUser() authUser: User
  ) {
    if (logo) {
      metaModelCreateInput.logo = logo;
    }
    return await this.metaModelsService.create(metaModelCreateInput, selection, authUser);
  }

  @CheckPolicies((args) => ({
    action: Action.Update,
    subject: MetaModel.name,
    fields: args.metamodelUpdateInput
  }))
  @Mutation(() => MetaModel, { name: 'updateMetaModel', nullable: true })
  async update(
    @Args('metaModelUpdateInput') metaModelUpdateInput: MetaModelUpdateInput,
    @Args('logoFile', { type: () => GraphQLUpload, nullable: true }, UploadTransform) logo: string,
    @SelectionSet() selection: SelectionInput,
    @AuthUser() authUser: User
  ) {
    if (logo) {
      metaModelUpdateInput.logo = logo;
    }
    return await this.metaModelsService.update(metaModelUpdateInput, selection, authUser);
  }

  @CheckPolicies(() => ({
    action: Action.Delete,
    subject: MetaModel.name
  }))
  @Mutation(() => GraphQLUUID, { name: 'deleteMetaModel' })
  async delete(
    @Args('id', { type: () => GraphQLUUID }) id: string,
    @Args('password') password: string,
    @AuthUser() authUser: User
  ) {
    return await this.metaModelsService.delete(id, password, authUser);
  }

  @Public()
  @CheckPolicies(() => ({
    action: Action.Read,
    subject: MetaModel.name
  }))
  @Query(() => Boolean, { name: 'checkMetaModelTagExists', nullable: true })
  async checkTagExists(@Args('tag') tag: string) {
    return await this.metaModelsService.checkTagExists(tag);
  }

  @CheckPolicies((args) => ({
    action: Action.Update,
    subject: MetaModel.name,
    fields: args.metaelementCreateInput
  }))
  @Mutation(() => MetaElement, { name: 'createMetaElement', nullable: true })
  async createMetaElement(
    @Args('metaElementCreateInput') metaElementCreateInput: MetaElementCreateInput,
    @SelectionSet() selection: SelectionInput,
    @AuthUser() authUser: User
  ) {
    return await this.metaModelsService.createMetaElement(metaElementCreateInput, selection, authUser);
  }

  @CheckPolicies((args) => ({
    action: Action.Update,
    subject: MetaModel.name,
    fields: args.metaelementUpdateInput
  }))
  @Mutation(() => MetaElement, { name: 'updateMetaElement', nullable: true })
  async updateMetaElement(
    @Args('metaElementUpdateInput') metaElementUpdateInput: MetaElementUpdateInput,
    @SelectionSet() selection: SelectionInput,
    @AuthUser() authUser: User
  ) {
    console.log(metaElementUpdateInput);
    return await this.metaModelsService.updateMetaElement(metaElementUpdateInput, selection, authUser);
  }

  @Public()
  @CheckPolicies(() => ({
    action: Action.Read,
    subject: MetaModel.name
  }))
  @Query(() => MetaModel, { name: 'metaModel', nullable: true })
  async findOne(
    @Args('id', { type: () => GraphQLUUID }) id: string,
    @SelectionSet() selection: SelectionInput,
    @AuthUser() authUser: User
  ) {
    return await this.metaModelsService.findOne(id, selection, authUser);
  }

  @Public()
  @CheckPolicies((args) => ({
    action: Action.Filter,
    subject: MetaModel.name,
    fields: args.where
  }))
  @Query(() => MetaModels, { name: 'metaModels' })
  async findMany(
    @Args('where', { type: () => [MetaModelWhereInput], nullable: true }, TypeORMWhereTransform<MetaModel>)
    where: FindOptionsWhere<MetaModel>,
    @Args('order', { type: () => [MetaModelOrderInput], nullable: true }, TypeORMOrderTransform<MetaModel>)
    order: FindOptionsOrder<MetaModel>,
    @Args('pagination', { nullable: true }) pagination: PaginationInput,
    @SelectionSet({ root: 'set' }) selection: SelectionInput
  ) {
    return await this.metaModelsService.findMany(where, order, pagination, selection);
  }
}
