import { Module } from '@nestjs/common';
import { ProductionsService } from './productions.service';
import { ProductionsController } from './productions.controller';

@Module({
  providers: [ProductionsService],
  controllers: [ProductionsController]
})
export class ProductionsModule {}
