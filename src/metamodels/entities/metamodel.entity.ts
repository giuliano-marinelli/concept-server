import {
  Extensions,
  Field,
  InputType,
  IntersectionType,
  ObjectType,
  OmitType,
  PartialType,
  PickType,
  registerEnumType
} from '@nestjs/graphql';

import { FilterField, FilterOrderType, FilterWhereType, Many } from '@nestjs!/graphql-filter';

import { MaxLength, MinLength } from 'class-validator';
import { GraphQLUUID } from 'graphql-scalars';
import { CheckPolicy } from 'src/casl/casl.middleware';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';

export enum Role {
  USER = 'user',
  ADMIN = 'admin'
}

registerEnumType(Role, {
  name: 'Role',
  description: 'Defines wich permissions user has.',
  valuesMap: {
    USER: {
      description: 'User role can access to application basic features.'
    },
    ADMIN: {
      description: 'Admin role can access to all application features.'
    }
  }
});

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
  @MaxLength(30)
  name: string;

  @Field()
  @FilterField()
  @Column()
  @MinLength(4)
  @MaxLength(30)
  tagname: string;

  @Field()
  @FilterField()
  @Column()
  version: number;

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
}

@InputType()
export class MetamodelCreateInput extends PickType(Metamodel, ['name', 'tagname', 'logo'], InputType) {}

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
