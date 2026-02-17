import { Test, TestingModule } from '@nestjs/testing';
import { ProductionsController } from './productions.controller';

describe('ProductionsController', () => {
  let controller: ProductionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductionsController],
    }).compile();

    controller = module.get<ProductionsController>(ProductionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
