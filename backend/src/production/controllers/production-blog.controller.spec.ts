import { Test, TestingModule } from "@nestjs/testing";
import { ProductionBlogController } from "./production-blog.controller";
import { ProductionService } from "../production.service";
import { BlogDto, ProductionDto } from "../../dto/dto";
import { NotFoundException, BadRequestException } from "@nestjs/common";

describe("ProductionBlogController", () => {
  let controller: ProductionBlogController;
  let service: ProductionService;

  const mockProduction: ProductionDto = {
    id: 1,
    titel: "The Great Show",
    ondertitel: "A masterpiece",
    description1: "An amazing production",
    description2: "With great actors",
    genre: "Drama",
    planning_id: 1,
  };

  const mockBlog: BlogDto = {
    id: 1,
    titel: "Behind the Scenes",
    description: "Looking at the set of The Great Show.",
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductionBlogController],
      providers: [
        {
          provide: ProductionService,
          useValue: {
            getProductionBlogs: jest.fn(),
            linkBlogToProduction: jest.fn(),
            unlinkBlogFromProduction: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProductionBlogController>(ProductionBlogController);
    service = module.get<ProductionService>(ProductionService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getProductionBlogs", () => {
    it("should return an array of blogs linked to the production", async () => {
      const expectedBlogs = [mockBlog];
      jest.spyOn(service, "getProductionBlogs").mockResolvedValueOnce(expectedBlogs);

      const result = await controller.getProductionBlogs(1);

      expect(service.getProductionBlogs).toHaveBeenCalledWith(1);
      expect(result).toEqual(expectedBlogs);
    });

    it("should throw a NotFoundException if the production is not found", async () => {
      jest.spyOn(service, "getProductionBlogs").mockRejectedValueOnce(new NotFoundException());

      await expect(controller.getProductionBlogs(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe("linkBlogToProduction", () => {
    it("should link a blog to a production and return the blog", async () => {
      jest.spyOn(service, "linkBlogToProduction").mockResolvedValueOnce(mockBlog);

      const result = await controller.linkBlogToProduction(1, 2);

      expect(service.linkBlogToProduction).toHaveBeenCalledWith(1, 2);
      expect(result).toEqual(mockBlog);
    });

    it("should pass through errors when linking fails", async () => {
      jest.spyOn(service, "linkBlogToProduction").mockRejectedValueOnce(new BadRequestException("Already linked"));

      await expect(controller.linkBlogToProduction(1, 2)).rejects.toThrow(BadRequestException);
    });
  });

  describe("unlinkBlogFromProduction", () => {
    it("should unlink a blog from a production and return the production", async () => {
      jest.spyOn(service, "unlinkBlogFromProduction").mockResolvedValueOnce(mockProduction);

      const result = await controller.unlinkBlogFromProduction(1, 2);

      expect(service.unlinkBlogFromProduction).toHaveBeenCalledWith(1, 2);
      expect(result).toEqual(mockProduction);
    });

    it("should pass through errors when unlinking fails", async () => {
      jest.spyOn(service, "unlinkBlogFromProduction").mockRejectedValueOnce(new NotFoundException("Link not found"));

      await expect(controller.unlinkBlogFromProduction(1, 2)).rejects.toThrow(NotFoundException);
    });
  });
});
