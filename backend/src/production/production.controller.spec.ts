import { Test, TestingModule } from "@nestjs/testing";
import { ProductionController } from "./production.controller";
import { ProductionService } from "./production.service";
import { BlogDto, ProductionDto, UpdateProductionDto, TagDto } from "../dto/dto"; 
import { NotFoundException, BadRequestException } from "@nestjs/common";

describe("ProductionController", () => {
  let controller: ProductionController;
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

  const mockProductions: ProductionDto[] = [mockProduction];

  const mockTags: TagDto[] = [
    {
      id: 1,
      tag: "Drama",
    },
    {
      id: 2,
      tag: "Classical",
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductionController],
      providers: [
        {
          provide: ProductionService,
          useValue: {
            getAllProductions: jest.fn().mockResolvedValue(mockProductions),
            getProductionById: jest.fn().mockResolvedValue(mockProduction),
            getTagsById: jest.fn().mockResolvedValue(mockTags),
            replaceProduction: jest.fn().mockResolvedValue(mockProduction),
            modifyProduction: jest.fn().mockResolvedValue(mockProduction),
            deleteProduction: jest.fn().mockResolvedValue(undefined),
            // New mock methods
            createProduction: jest.fn(),
            getProductionBlogs: jest.fn(),
            linkBlogToProduction: jest.fn(),
            unlinkBlogFromProduction: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProductionController>(ProductionController);
    service = module.get<ProductionService>(ProductionService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getAllProductions", () => {
    it("should return an array of productions", async () => {
      const result = await controller.getAllProductions();
      expect(result).toEqual(mockProductions);
      expect(service.getAllProductions).toHaveBeenCalled();
    });

    it("should call service.getAllProductions", async () => {
      await controller.getAllProductions();
      expect(service.getAllProductions).toHaveBeenCalledTimes(1);
    });

    it("should return empty array when no productions exist", async () => {
      jest.spyOn(service, "getAllProductions").mockResolvedValueOnce([]);
      const result = await controller.getAllProductions();
      expect(result).toEqual([]);
    });
  });

  describe("getById", () => {
    it("should return a single production by id", async () => {
      const result = await controller.getProductionById(1);
      expect(result).toEqual(mockProduction);
      expect(service.getProductionById).toHaveBeenCalledWith(1);
    });

    it("should call service.getProductionById with correct id", async () => {
      await controller.getProductionById(1);
      expect(service.getProductionById).toHaveBeenCalledWith(1);
    });

    it("should handle different production ids", async () => {
      const production2 = { ...mockProduction, id: 2 };
      jest
        .spyOn(service, "getProductionById")
        .mockResolvedValueOnce(production2);
      const result = await controller.getProductionById(2);
      expect(result.id).toBe(2);
      expect(service.getProductionById).toHaveBeenCalledWith(2);
    });

    it("should throw a NotFoundException if the production does not exist", async () => {
      // Simulate the service not finding the ID in the database
      jest.spyOn(service, "getProductionById").mockRejectedValueOnce(new NotFoundException("ProductionDto not found"));
    
      // Verify the controller passes the exact same exception up
      await expect(controller.getProductionById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe("replaceProduction", () => {
    it("should replace and return the production", async () => {
      const result = await controller.replaceProduction(1, mockProduction);
      expect(service.replaceProduction).toHaveBeenCalledWith(1, mockProduction);
      expect(result).toEqual(mockProduction);
    });

    it("should throw a NotFoundException if trying to replace a non-existent production", async () => {
      jest.spyOn(service, "replaceProduction").mockRejectedValueOnce(new NotFoundException("ProductionDto not found"));
    
      await expect(controller.replaceProduction(999, mockProduction)).rejects.toThrow(NotFoundException);
    });
  });

  describe("modifyProduction", () => {
    it("should modify and return the production", async () => {
      const patchData: UpdateProductionDto = { titel: "A New titel" };
      const patchedProduction = { ...mockProduction, titel: "A New titel" };
      
      jest.spyOn(service, "modifyProduction").mockResolvedValueOnce(patchedProduction);
      
      const result = await controller.modifyProduction(1, patchData);
      expect(service.modifyProduction).toHaveBeenCalledWith(1, patchData);
      expect(result).toEqual(patchedProduction);
    });

    it("should throw a NotFoundException if trying to modify a non-existent production", async () => {
      const patchData: UpdateProductionDto = { titel: "A New titel" };
      
      jest.spyOn(service, "modifyProduction").mockRejectedValueOnce(new NotFoundException("ProductionDto not found"));
    
      await expect(controller.modifyProduction(999, patchData)).rejects.toThrow(NotFoundException);
    });
  });

  describe("deleteProduction", () => {
    it("should delete the production by id", async () => {
      const result = await controller.deleteProduction(1);
      expect(service.deleteProduction).toHaveBeenCalledWith(1);
      expect(result).toBeUndefined();
    });

    it("should throw a NotFoundException if trying to delete a non-existent production", async () => {
      jest.spyOn(service, "deleteProduction").mockRejectedValueOnce(new NotFoundException("ProductionDto not found"));
    
      await expect(controller.deleteProduction(999)).rejects.toThrow(NotFoundException);
    });
  });


  describe("getTagsOfProductionByID", () => {
    it("should return tags for a production", async () => {
      const result = await controller.getTagsOfProductionByID(1);
      expect(result).toEqual(mockTags);
      expect(service.getTagsById).toHaveBeenCalledWith(1);
    });

    it("should call service.getTagsById with the correct production id", async () => {
      await controller.getTagsOfProductionByID(1);
      expect(service.getTagsById).toHaveBeenCalledWith(1);
      expect(service.getTagsById).toHaveBeenCalledTimes(1);
    });

    it("should return empty array when production has no tags", async () => {
      jest.spyOn(service, "getTagsById").mockResolvedValueOnce([]);
      const result = await controller.getTagsOfProductionByID(1);
      expect(result).toEqual([]);
    });

    it("should handle different production ids", async () => {
      await controller.getTagsOfProductionByID(2);
      expect(service.getTagsById).toHaveBeenCalledWith(2);
    });

    it("should throw a NotFoundException if the production does not exist", async () => {
      jest.spyOn(service, "getTagsById").mockRejectedValueOnce(new NotFoundException("ProductionDto not found"));

      await expect(controller.getTagsOfProductionByID(999)).rejects.toThrow(NotFoundException);
    });

    it("should handle database errors when fetching tags fails", async () => {
      jest.spyOn(service, "getTagsById").mockRejectedValueOnce(new Error("Failed to fetch tags"));

      await expect(controller.getTagsOfProductionByID(1)).rejects.toThrow("Failed to fetch tags");
    });
  });

  describe("-- Blogs --", () => {
    const mockBlog: BlogDto = {
      id: 1,
      titel: "Behind the Scenes",
      description: "Looking at the set of The Great Show.",
    };

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

    describe("unlinkBlogFromEvent", () => {
      it("should unlink a blog from a production and return the production", async () => {
        jest.spyOn(service, "unlinkBlogFromProduction").mockResolvedValueOnce(mockProduction);

        const result = await controller.unlinkBlogFromEvent(1, 2);

        expect(service.unlinkBlogFromProduction).toHaveBeenCalledWith(1, 2);
        expect(result).toEqual(mockProduction);
      });

      it("should pass through errors when unlinking fails", async () => {
        jest.spyOn(service, "unlinkBlogFromProduction").mockRejectedValueOnce(new NotFoundException("Link not found"));

        await expect(controller.unlinkBlogFromEvent(1, 2)).rejects.toThrow(NotFoundException);
      });
    });
  });

  // TODO: Missing createProduction test
  describe("createProduction", () => {
    it("should create a production", async () => {

    });

    it("should handle database errors when creation fails", async () => {

    });
  });
});
