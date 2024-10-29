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

import {
  Metamodel,
  MetamodelCreateInput,
  MetamodelOrderInput,
  MetamodelUpdateInput,
  MetamodelWhereInput,
  Metamodels
} from './entities/metamodel.entity';
import { User } from 'src/users/entities/user.entity';

import { MetamodelsService } from './metamodels.service';

@Resolver(() => Metamodel)
export class MetamodelsResolver {
  constructor(private readonly metamodelsService: MetamodelsService) {}

  @Public()
  @CheckPolicies((args) => ({
    action: Action.Create,
    subject: Metamodel.name,
    fields: args.metamodelCreateInput
  }))
  @Mutation(() => Metamodel, { name: 'createMetamodel', nullable: true })
  async create(
    @Args('metamodelCreateInput') metamodelCreateInput: MetamodelCreateInput,
    @Args('logoFile', { type: () => GraphQLUpload, nullable: true }, UploadTransform) logo: string,
    @SelectionSet() selection: SelectionInput,
    @AuthUser() authUser: User
  ) {
    if (logo) {
      metamodelCreateInput.logo = logo;
    }
    console.log('metamodelCreateInput', metamodelCreateInput);
    return await this.metamodelsService.create(metamodelCreateInput, selection, authUser);
  }

  @CheckPolicies((args) => ({
    action: Action.Update,
    subject: Metamodel.name,
    fields: args.metamodelUpdateInput
  }))
  @Mutation(() => Metamodel, { name: 'updateMetamodel', nullable: true })
  async update(
    @Args('metamodelUpdateInput') metamodelUpdateInput: MetamodelUpdateInput,
    @Args('logoFile', { type: () => GraphQLUpload, nullable: true }, UploadTransform) logo: string,
    @SelectionSet() selection: SelectionInput,
    @AuthUser() authUser: User
  ) {
    if (logo) {
      metamodelUpdateInput.logo = logo;
    }
    return await this.metamodelsService.update(metamodelUpdateInput, selection, authUser);
  }

  @CheckPolicies(() => ({
    action: Action.Delete,
    subject: Metamodel.name
  }))
  @Mutation(() => GraphQLUUID, { name: 'deleteMetamodel' })
  async delete(
    @Args('id', { type: () => GraphQLUUID }) id: string,
    @Args('password') password: string,
    @AuthUser() authUser: User
  ) {
    return await this.metamodelsService.delete(id, password, authUser);
  }

  @Public()
  @CheckPolicies(() => ({
    action: Action.Read,
    subject: Metamodel.name
  }))
  @Query(() => Boolean, { name: 'checkMetamodelTagnameExists', nullable: true })
  async checkTagnameExists(@Args('tagname') tagname: string) {
    return await this.metamodelsService.checkTagnameExists(tagname);
  }

  @Public()
  @CheckPolicies(() => ({
    action: Action.Read,
    subject: Metamodel.name
  }))
  @Query(() => Metamodel, { name: 'metamodel', nullable: true })
  async findOne(
    @Args('id', { type: () => GraphQLUUID }) id: string,
    @SelectionSet() selection: SelectionInput,
    @AuthUser() authUser: User
  ) {
    return await this.metamodelsService.findOne(id, selection, authUser);
  }

  @Public()
  @CheckPolicies((args) => ({
    action: Action.Filter,
    subject: Metamodel.name,
    fields: args.where
  }))
  @Query(() => Metamodels, { name: 'metamodels' })
  async findMany(
    @Args('where', { type: () => [MetamodelWhereInput], nullable: true }, TypeORMWhereTransform<Metamodel>)
    where: FindOptionsWhere<Metamodel>,
    @Args('order', { type: () => [MetamodelOrderInput], nullable: true }, TypeORMOrderTransform<Metamodel>)
    order: FindOptionsOrder<Metamodel>,
    @Args('pagination', { nullable: true }) pagination: PaginationInput,
    @SelectionSet({ root: 'set' }) selection: SelectionInput
  ) {
    return await this.metamodelsService.findMany(where, order, pagination, selection);
  }
}
