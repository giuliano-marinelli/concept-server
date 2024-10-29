import { Field, InputType, IntersectionType, ObjectType, PartialType, PickType } from '@nestjs/graphql';

import { GModelElement } from '@eclipse-glsp/server';
import { FilterField, FilterOrderType, FilterWhereType, Many } from '@nestjs!/graphql-filter';

import { MaxLength, MinLength } from 'class-validator';
import { GraphQLJSON, GraphQLUUID } from 'graphql-scalars';
import { CheckPolicy } from 'src/casl/casl.middleware';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';

import { Metamodel, MetamodelOrderInput, MetamodelWhereInput } from './metamodel.entity';

@ObjectType()
@InputType('MetanodeInput', { isAbstract: true })
@Entity()
export class Metanode {
  @Field(() => GraphQLUUID)
  @FilterField()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => Metamodel, { middleware: [CheckPolicy] })
  @FilterField(() => MetamodelWhereInput, () => MetamodelOrderInput)
  @ManyToOne(() => Metamodel, (metamodel) => metamodel.metanodes)
  metamodel: Metamodel;

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

  @Field(() => GraphQLJSON, { nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  gModel: GModelElement;

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
}

@InputType()
export class MetanodeCreateInput extends PickType(
  Metanode,
  ['metamodel', 'name', 'tagname', 'gModel', 'preview'],
  InputType
) {}

@InputType()
export class MetanodeUpdateInput extends IntersectionType(
  PickType(Metanode, ['id'], InputType),
  PartialType(MetanodeCreateInput)
) {}

@InputType()
export class MetanodeRefInput extends PickType(Metanode, ['id'], InputType) {}

@FilterWhereType(Metanode)
export class MetanodeWhereInput {}

@FilterOrderType(Metanode)
export class MetanodeOrderInput {}

@Many(Metanode, { setName: 'set' })
export class Metanodes {}
