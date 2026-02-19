import { Test, TestingModule } from '@nestjs/testing';
import { ProductionsService } from './productions.service';

describe('ProductionsService', () => {
  let service: ProductionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductionsService],
    }).compile();

    service = module.get<ProductionsService>(ProductionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
