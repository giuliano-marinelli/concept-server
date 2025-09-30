import { Field, InputType, IntersectionType, ObjectType, OmitType, PartialType, PickType } from '@nestjs/graphql';

import { DynamicModel } from '@dynamic-glsp/server';
import { FilterField, FilterOrderType, FilterWhereType, Many } from '@nestjs!/graphql-filter';

import { MaxLength, MinLength } from 'class-validator';
import { GraphQLJSON, GraphQLSemVer, GraphQLUUID } from 'graphql-scalars';
import { CheckPolicy } from 'src/casl/casl.middleware';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';

import {
  MetaModel,
  MetaModelOrderInput,
  MetaModelRefInput,
  MetaModelWhereInput
} from 'src/meta-models/entities/meta-model.entity';
import { Profile, ProfileOrderInput, ProfileWhereInput } from 'src/users/entities/profile.entity';
import { User, UserOrderInput, UserRefInput, UserWhereInput } from 'src/users/entities/user.entity';

@ObjectType()
@InputType('ModelInput', { isAbstract: true })
@Entity()
export class Model {
  @Field(() => GraphQLUUID)
  @FilterField()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field({ nullable: true })
  @FilterField()
  @Column({ nullable: true })
  @MinLength(1)
  @MaxLength(30)
  name: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  source: DynamicModel;

  @Field()
  @FilterField()
  @Column()
  @Index()
  @MinLength(1)
  @MaxLength(30)
  tag: string;

  @Field(() => [String], { nullable: true })
  @FilterField()
  @Column('text', { array: true, nullable: true })
  tags: string[];

  @Field(() => GraphQLSemVer)
  @FilterField()
  @Column()
  version: string;

  @Field({ nullable: true })
  @FilterField()
  @Column({ nullable: true })
  @MaxLength(200)
  description: string;

  @Field({ nullable: true })
  @FilterField()
  @Column({ nullable: true })
  preview: string;

  @Field({ nullable: true })
  @FilterField()
  @CreateDateColumn()
  createdAt: Date;

  @Field({ nullable: true })
  @FilterField()
  @UpdateDateColumn()
  updatedAt: Date;

  @Field({ nullable: true })
  @FilterField()
  @DeleteDateColumn()
  deletedAt: Date;

  @Field(() => User, { nullable: true, middleware: [CheckPolicy] })
  @FilterField(() => UserWhereInput, () => UserOrderInput)
  @ManyToOne(() => User, (user) => user.ownModels)
  owner: User;

  @Field(() => [User], { nullable: true, middleware: [CheckPolicy] })
  @FilterField(() => UserWhereInput, () => UserOrderInput)
  @ManyToMany(() => User, (user) => user.collabModels)
  @JoinTable({ name: 'model_collaborators' })
  collaborators: User[];

  @Field(() => MetaModel)
  @FilterField(() => MetaModelWhereInput, () => MetaModelOrderInput)
  @ManyToOne(() => MetaModel, (metaModel) => metaModel.models)
  metaModel: MetaModel;

  @Field(() => [User], { nullable: true, middleware: [CheckPolicy] })
  @FilterField(() => UserWhereInput, () => UserOrderInput)
  @ManyToMany(() => User, (user) => user.pinnedModels, { nullable: true })
  pinnedIn: User[];
}

@InputType()
export class ModelCreateInput extends PickType(
  Model,
  ['name', 'tag', 'tags', 'description', 'preview', 'source'],
  InputType
) {
  @Field(() => UserRefInput)
  owner: UserRefInput;

  @Field(() => MetaModelRefInput)
  metaModel: MetaModelRefInput;
}

@InputType()
export class ModelUpdateInput extends IntersectionType(
  PickType(Model, ['id'], InputType),
  PartialType(OmitType(ModelCreateInput, ['metaModel']))
) {}

@InputType()
export class ModelRefInput extends PickType(Model, ['id'], InputType) {}

@FilterWhereType(Model)
export class ModelWhereInput {}

@FilterOrderType(Model)
export class ModelOrderInput {}

@Many(Model, { setName: 'set' })
export class Models {}
