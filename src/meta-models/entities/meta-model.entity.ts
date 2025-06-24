import { Field, InputType, IntersectionType, ObjectType, PartialType, PickType } from '@nestjs/graphql';

import { FilterField, FilterOrderType, FilterWhereType, Many } from '@nestjs!/graphql-filter';

import { ArrayMaxSize, MaxLength, MinLength } from 'class-validator';
import { GraphQLSemVer, GraphQLUUID } from 'graphql-scalars';
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
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';

import { MetaElement, MetaElementOrderInput, MetaElementWhereInput } from './meta-element.entity';
import { Model, ModelOrderInput, ModelWhereInput } from 'src/models/entities/model.entity';
import { User, UserOrderInput, UserRefInput, UserWhereInput } from 'src/users/entities/user.entity';

@ObjectType()
@InputType('MetaModelInput', { isAbstract: true })
@Entity()
export class MetaModel {
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
  @ArrayMaxSize(5)
  @MinLength(1, { each: true })
  @MaxLength(15, { each: true })
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
  logo: string;

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
  @ManyToOne(() => User, (user) => user.ownMetaModels)
  owner: User;

  @Field(() => [User], { nullable: true, middleware: [CheckPolicy] })
  @FilterField(() => UserWhereInput, () => UserOrderInput)
  @ManyToMany(() => User, (user) => user.collabMetaModels)
  @JoinTable({ name: 'meta_model_collaborators' })
  collaborators: User[];

  @Field(() => [MetaElement], { nullable: true })
  @FilterField(() => MetaElementWhereInput, () => MetaElementOrderInput)
  @OneToMany(() => MetaElement, (metaElement) => metaElement.metaModel, { cascade: true })
  metaElements: MetaElement[];

  @Field(() => [Model], { nullable: true })
  @FilterField(() => ModelWhereInput, () => ModelOrderInput)
  @OneToMany(() => Model, (model) => model.metaModel, { cascade: false })
  models: Model[];

  @Field(() => [User], { nullable: true, middleware: [CheckPolicy] })
  @FilterField(() => UserWhereInput, () => UserOrderInput)
  @ManyToMany(() => User, (user) => user.pinnedMetaModels, { nullable: true })
  pinnedIn: User[];
}

@InputType()
export class MetaModelCreateInput extends PickType(
  MetaModel,
  ['name', 'tag', 'tags', 'description', 'logo'],
  InputType
) {
  @Field(() => UserRefInput)
  owner: UserRefInput;
}

@InputType()
export class MetaModelUpdateInput extends IntersectionType(
  PickType(MetaModel, ['id'], InputType),
  PartialType(MetaModelCreateInput)
) {}

@InputType()
export class MetaModelRefInput extends PickType(MetaModel, ['id'], InputType) {}

@FilterWhereType(MetaModel)
export class MetaModelWhereInput {}

@FilterOrderType(MetaModel)
export class MetaModelOrderInput {}

@Many(MetaModel, { setName: 'set' })
export class MetaModels {}
