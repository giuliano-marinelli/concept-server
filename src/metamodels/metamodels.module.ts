import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Metamodel } from './entities/metamodel.entity';
import { Metanode } from './entities/metanode.entity';

import { MetamodelsResolver } from './metamodels.resolver';

import { MetamodelsService } from './metamodels.service';

@Module({
  imports: [TypeOrmModule.forFeature([Metamodel]), TypeOrmModule.forFeature([Metanode])],
  providers: [MetamodelsResolver, MetamodelsService],
  exports: [MetamodelsService, TypeOrmModule]
})
export class MetamodelsModule {}
