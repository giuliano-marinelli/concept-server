import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MetaElement } from './entities/meta-element.entity';
import { MetaModel } from './entities/meta-model.entity';

import { MetaModelsResolver } from './meta-models.resolver';

import { MetaModelsService } from './meta-models.service';

@Module({
  imports: [TypeOrmModule.forFeature([MetaModel]), TypeOrmModule.forFeature([MetaElement])],
  providers: [MetaModelsResolver, MetaModelsService],
  exports: [MetaModelsService, TypeOrmModule]
})
export class MetaModelsModule {}
