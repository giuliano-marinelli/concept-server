import { Field, InputType, IntersectionType, ObjectType, PartialType, PickType } from '@nestjs/graphql';

import { FilterField, FilterOrderType, FilterWhereType, Many } from '@nestjs!/graphql-filter';

import { MaxLength, MinLength } from 'class-validator';
import { GraphQLSemVer, GraphQLUUID } from 'graphql-scalars';
import { CheckPolicy } from 'src/casl/casl.middleware';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';

import { Metanode, MetanodeOrderInput, MetanodeWhereInput } from './metanode.entity';
import { User, UserOrderInput, UserRefInput, UserWhereInput } from 'src/users/entities/user.entity';

@ObjectType()
@InputType('MetamodelInput', { isAbstract: true })
@Entity()
export class Metamodel {
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
  @MinLength(1)
  @MaxLength(30)
  tagname: string;

  @Field(() => GraphQLSemVer)
  @FilterField()
  @Column()
  version: string;

  @Field({ nullable: true })
  @FilterField()
  @Column({ nullable: true })
  logo: string;

  @Field(() => [String], { nullable: true })
  @FilterField()
  @Column('text', { array: true, nullable: true })
  tags: string[];

  @Field(() => User, { nullable: true, middleware: [CheckPolicy] })
  @FilterField(() => UserWhereInput, () => UserOrderInput)
  @ManyToOne(() => User, (user) => user.metamodels)
  owner: User;

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

  @Field(() => [User], { nullable: true, middleware: [CheckPolicy] })
  @FilterField(() => UserWhereInput, () => UserOrderInput)
  @ManyToMany(() => User, (user) => user.metamodels)
  collaborators: User[];

  @Field(() => [Metanode], { nullable: true, middleware: [CheckPolicy] })
  @FilterField(() => MetanodeWhereInput, () => MetanodeOrderInput)
  @OneToMany(() => Metanode, (metanode) => metanode.metamodel, { cascade: true })
  metanodes: Metanode[];
}

@InputType()
export class MetamodelCreateInput extends PickType(Metamodel, ['name', 'tagname', 'logo', 'tags'], InputType) {
  @Field(() => UserRefInput)
  owner: UserRefInput;
}

@InputType()
export class MetamodelUpdateInput extends IntersectionType(
  PickType(Metamodel, ['id'], InputType),
  PartialType(MetamodelCreateInput)
) {}

@InputType()
export class MetamodelRefInput extends PickType(Metamodel, ['id'], InputType) {}

@FilterWhereType(Metamodel)
export class MetamodelWhereInput {}

@FilterOrderType(Metamodel)
export class MetamodelOrderInput {}

@Many(Metamodel, { setName: 'set' })
export class Metamodels {}
