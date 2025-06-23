import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Model } from './entities/model.entity';
import { MetaModel } from 'src/meta-models/entities/meta-model.entity';
import { User } from 'src/users/entities/user.entity';

import { ModelsResolver } from './models.resolver';

import { ModelsService } from './models.service';

@Module({
  imports: [TypeOrmModule.forFeature([Model]), TypeOrmModule.forFeature([MetaModel]), TypeOrmModule.forFeature([User])],
  providers: [ModelsResolver, ModelsService],
  exports: [ModelsService, TypeOrmModule]
})
export class ModelsModule {}
