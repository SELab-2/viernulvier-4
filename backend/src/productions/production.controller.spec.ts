import { Test, TestingModule } from "@nestjs/testing";
import { ProductionController } from "./production.controller";

describe("ProductionsController", () => {
  let controller: ProductionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductionController],
    }).compile();

    controller = module.get<ProductionController>(ProductionController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
