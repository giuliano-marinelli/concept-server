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

import { Transform } from 'class-transformer';
import { IsEmail, MaxLength, MinLength } from 'class-validator';
import { GraphQLEmailAddress, GraphQLUUID } from 'graphql-scalars';
import { CheckPolicy } from 'src/casl/casl.middleware';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';

import { Profile, ProfileOrderInput, ProfileWhereInput } from './profile.entity';
import { Email, EmailOrderInput, EmailWhereInput } from 'src/emails/entities/email.entity';
import { MetaModel, MetaModelOrderInput, MetaModelWhereInput } from 'src/meta-models/entities/meta-model.entity';
import { Model, ModelOrderInput, ModelWhereInput } from 'src/models/entities/model.entity';
import { Session, SessionOrderInput, SessionWhereInput } from 'src/sessions/entities/session.entity';

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
@InputType('UserInput', { isAbstract: true })
@Entity()
export class User {
  @Field(() => GraphQLUUID)
  @FilterField()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @FilterField()
  @Column()
  @MinLength(4)
  @MaxLength(30)
  username: string;

  @Field({ middleware: [CheckPolicy] })
  @Column()
  @MinLength(8)
  @MaxLength(100)
  password: string;

  @Field({ nullable: true, defaultValue: Role.USER })
  @FilterField()
  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: string;

  @Field(() => Email, { nullable: true, middleware: [CheckPolicy] })
  @FilterField(() => EmailWhereInput, () => EmailOrderInput)
  @OneToOne(() => Email, (email) => email.user, { cascade: true })
  @JoinColumn({ referencedColumnName: 'id' })
  @Extensions({ owner: 'id' })
  primaryEmail: Email;

  @Field(() => Profile, { nullable: true })
  @FilterField(() => ProfileWhereInput, () => ProfileOrderInput)
  @Column(() => Profile)
  profile: Profile;

  @Field({ nullable: true, middleware: [CheckPolicy] })
  @FilterField()
  @Column({ nullable: true })
  verificationCode: string;

  @Field({ nullable: true, middleware: [CheckPolicy] })
  @FilterField()
  @Column({ nullable: true })
  lastVerificationTry: Date;

  @Field({ nullable: true, middleware: [CheckPolicy] })
  @FilterField()
  @Column({ nullable: true })
  passwordCode: string;

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

  @Field(() => [Email], { nullable: true, middleware: [CheckPolicy] })
  @FilterField(() => EmailWhereInput, () => EmailOrderInput)
  @OneToMany(() => Email, (email) => email.user, { cascade: true, eager: true })
  @Extensions({ owner: 'id' })
  emails: Email[];

  @Field(() => [Session], { nullable: true, middleware: [CheckPolicy] })
  @FilterField(() => SessionWhereInput, () => SessionOrderInput)
  @OneToMany(() => Session, (session) => session.user, { cascade: true })
  @Extensions({ owner: 'id' })
  sessions: Session[];

  @Field(() => [MetaModel], { nullable: true, middleware: [CheckPolicy] })
  @FilterField(() => MetaModelWhereInput, () => MetaModelOrderInput)
  @OneToMany(() => MetaModel, (metaModel) => metaModel.owner)
  @Extensions({ owner: 'id' })
  ownMetaModels: MetaModel[];

  @Field(() => [MetaModel], { nullable: true, middleware: [CheckPolicy] })
  @FilterField(() => MetaModelWhereInput, () => MetaModelOrderInput)
  @ManyToMany(() => MetaModel, (metaModel) => metaModel.collaborators)
  @Extensions({ owner: 'id' })
  collabMetaModels: MetaModel[];

  @Field(() => [MetaModel], { nullable: true, middleware: [CheckPolicy] })
  @FilterField(() => MetaModelWhereInput, () => MetaModelOrderInput)
  @ManyToMany(() => MetaModel, (metaModel) => metaModel.pinnedIn, { nullable: true })
  @JoinTable({ name: 'pinned_meta_models' })
  @Extensions({ owner: 'id' })
  pinnedMetaModels: MetaModel[];

  @Field(() => [Model], { nullable: true, middleware: [CheckPolicy] })
  @FilterField(() => ModelWhereInput, () => ModelOrderInput)
  @OneToMany(() => Model, (model) => model.owner)
  @Extensions({ owner: 'id' })
  ownModels?: Model[];

  @Field(() => [Model], { nullable: true, middleware: [CheckPolicy] })
  @FilterField(() => ModelWhereInput, () => ModelOrderInput)
  @ManyToMany(() => Model, (model) => model.collaborators)
  @Extensions({ owner: 'id' })
  collabModels?: Model[];

  @Field(() => [Model], { nullable: true, middleware: [CheckPolicy] })
  @FilterField(() => ModelWhereInput, () => ModelOrderInput)
  @ManyToMany(() => Model, (model) => model.pinnedIn, { nullable: true })
  @JoinTable({ name: 'pinned_models' })
  @Extensions({ owner: 'id' })
  pinnedModels: Model[];
}

@InputType()
export class UserCreateInput extends PickType(User, ['username', 'password', 'profile'], InputType) {
  @Field(() => GraphQLEmailAddress)
  @IsEmail()
  @MaxLength(100)
  email: string;
}

@InputType()
export class UserUpdateInput extends IntersectionType(
  PickType(User, ['id'], InputType),
  PartialType(OmitType(UserCreateInput, ['password', 'email']))
) {}

@InputType()
export class UserRefInput extends PickType(User, ['id'], InputType) {}

@FilterWhereType(User)
export class UserWhereInput {}

@FilterOrderType(User)
export class UserOrderInput {}

@Many(User, { setName: 'set' })
export class Users {}
