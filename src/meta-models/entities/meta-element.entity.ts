import {
  Field,
  InputType,
  IntersectionType,
  ObjectType,
  OmitType,
  PartialType,
  PickType,
  registerEnumType
} from '@nestjs/graphql';

import { GModelElementSchema } from '@eclipse-glsp/server';
import { FilterField, FilterOrderType, FilterWhereType, Many } from '@nestjs!/graphql-filter';

import { Transform } from 'class-transformer';
import { MaxLength, MinLength } from 'class-validator';
import { GraphQLJSON, GraphQLUUID } from 'graphql-scalars';
import { AModelRootSchema } from 'src/dynamic-glsp/protocol/amodel';
import { LanguageElementType } from 'src/dynamic-glsp/protocol/language';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';

import { MetaModel, MetaModelOrderInput, MetaModelRefInput, MetaModelWhereInput } from './meta-model.entity';

registerEnumType(LanguageElementType, {
  name: 'LanguageElementType',
  description: 'Defines if the element is a node or an edge.',
  valuesMap: {
    NODE: {
      description: 'A node element of the meta model.'
    },
    EDGE: {
      description: 'An edge element of the meta model.'
    }
  }
});

@ObjectType()
@InputType('MetaElementInput', { isAbstract: true })
@Entity()
export class MetaElement {
  @Field(() => GraphQLUUID)
  @FilterField()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => MetaModel)
  @FilterField(() => MetaModelWhereInput, () => MetaModelOrderInput)
  @ManyToOne(() => MetaModel, (metamodel) => metamodel.metaElements)
  metaModel: MetaModel;

  @Field({ nullable: true, defaultValue: LanguageElementType.NODE })
  @FilterField()
  @Column({ type: 'enum', enum: LanguageElementType, default: LanguageElementType.NODE })
  type: string;

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

  @Field(() => GraphQLJSON, { nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  gModel: GModelElementSchema;

  @Field(() => GraphQLJSON, { nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  aModel: AModelRootSchema;

  @Field(() => GraphQLJSON, { nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  defaultModel: any;

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
export class MetaElementCreateInput extends PickType(
  MetaElement,
  ['type', 'name', 'tag', 'gModel', 'aModel', 'defaultModel', 'preview'],
  InputType
) {
  @Field(() => MetaModelRefInput)
  metaModel: MetaModelRefInput;
}

@InputType()
export class MetaElementUpdateInput extends IntersectionType(
  PickType(MetaElement, ['id'], InputType),
  PartialType(OmitType(MetaElementCreateInput, ['metaModel']))
) {}

@InputType()
export class MetaElementRefInput extends PickType(MetaElement, ['id'], InputType) {}

@FilterWhereType(MetaElement)
export class MetaElementWhereInput {}

@FilterOrderType(MetaElement)
export class MetaElementOrderInput {}

@Many(MetaElement, { setName: 'set' })
export class MetaElements {}
