import { Test, TestingModule } from "@nestjs/testing";
import { ProductionService } from "./production.service";
import { ProductionDatabaseService } from "../database/db.production.service";
import type {
  BlogDto,
  ProductionDto,
  UpdateProductionDto,
  CreateProductionDto,
  TagDto,
} from "../dto/dto";
import { BadRequestException } from "@nestjs/common";
import { BlogDatabaseService } from "../database/db.blog.service";
import { FilterProductionSchema } from "@repo/common";

describe("ProductionService", () => {
  let service: ProductionService;
  let dbService: ProductionDatabaseService;
  let blogDbService: BlogDatabaseService;

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
      providers: [
        ProductionService,
        {
          provide: ProductionDatabaseService,
          useValue: {
            getProductions: jest.fn().mockResolvedValue(mockProductions),
            getProductionById: jest.fn().mockResolvedValue(mockProduction),
            getTagsOfProduction: jest.fn().mockResolvedValue(mockTags),
            updateProduction: jest.fn().mockResolvedValue(mockProduction),
            deleteProduction: jest.fn().mockResolvedValue(undefined),
            createProduction: jest.fn(),
            getBlogsOfProduction: jest.fn(),
            linkBlogWithProductionID: jest.fn(),
            deleteBlogFromProduction: jest.fn(),
            // New mock methods
            addTagToProduction: jest.fn(),
            removeTagFromProduction: jest.fn(),
          },
        },
        {
          provide: BlogDatabaseService,
          useValue: {
            getBlogById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductionService>(ProductionService);
    dbService = module.get<ProductionDatabaseService>(
      ProductionDatabaseService,
    );
    blogDbService = module.get<BlogDatabaseService>(BlogDatabaseService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getAllProductions", () => {
    it("should return all productions from database", async () => {
      const result = await service.getAllProductions(
        FilterProductionSchema.parse({}),
      );
      expect(result).toEqual(mockProductions);
      expect(dbService.getProductions).toHaveBeenCalledWith(
        FilterProductionSchema.parse({}),
      );
    });

    it("should call dbService.getProductions with empty filter", async () => {
      await service.getAllProductions(FilterProductionSchema.parse({}));
      expect(dbService.getProductions).toHaveBeenCalledWith(
        FilterProductionSchema.parse({}),
      );
      expect(dbService.getProductions).toHaveBeenCalledTimes(1);
    });

    it("should return empty array when no productions exist", async () => {
      jest.spyOn(dbService, "getProductions").mockResolvedValueOnce([]);
      const result = await service.getAllProductions(
        FilterProductionSchema.parse({}),
      );
      expect(result).toEqual([]);
    });

    it("should handle database errors", async () => {
      jest
        .spyOn(dbService, "getProductions")
        .mockRejectedValueOnce(new Error("Database error"));
      await expect(
        service.getAllProductions(FilterProductionSchema.parse({})),
      ).rejects.toThrow("Database error");
    });
  });

  describe("getProductionById", () => {
    it("should return production by id from database", async () => {
      const result = await service.getProductionById(1);
      expect(result).toEqual(mockProduction);
      expect(dbService.getProductionById).toHaveBeenCalledWith(1);
    });

    it("should call dbService.getProductionById with correct id", async () => {
      await service.getProductionById(1);
      expect(dbService.getProductionById).toHaveBeenCalledWith(1);
      expect(dbService.getProductionById).toHaveBeenCalledTimes(1);
    });

    it("should handle different production ids", async () => {
      const production2 = { ...mockProduction, id: 2 };
      jest
        .spyOn(dbService, "getProductionById")
        .mockResolvedValueOnce(production2);
      const result = await service.getProductionById(2);
      expect(result.id).toBe(2);
      expect(dbService.getProductionById).toHaveBeenCalledWith(2);
    });

    it("should handle database error when production not found", async () => {
      jest
        .spyOn(dbService, "getProductionById")
        .mockRejectedValueOnce(
          new Error("No ProductionDto exists for provided ID"),
        );
      await expect(service.getProductionById(999)).rejects.toThrow(
        "No ProductionDto exists for provided ID",
      );
    });
  });

  describe("replaceProduction", () => {
    it("should successfully replace and return the production", async () => {
      const result = await service.replaceProduction(1, mockProduction);
      expect(dbService.updateProduction).toHaveBeenCalledWith(mockProduction);
      expect(result).toEqual(mockProduction);
    });

    it("should throw BadRequestException if url id and body id do not match", async () => {
      await expect(
        service.replaceProduction(2, mockProduction),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.replaceProduction(2, mockProduction),
      ).rejects.toThrow("ID in the URL must match ID in the body.");
    });
  });

  describe("modifyProduction", () => {
    it("should fetch, merge, update, and return the modified production", async () => {
      const patchData: UpdateProductionDto = { titel: "Patched titel" };
      const expectedMergedProduction = {
        ...mockProduction,
        ...patchData,
        id: 1,
      };

      jest
        .spyOn(dbService, "updateProduction")
        .mockResolvedValueOnce(expectedMergedProduction);

      const result = await service.modifyProduction(1, patchData);

      expect(dbService.getProductionById).toHaveBeenCalledWith(1);
      expect(dbService.updateProduction).toHaveBeenCalledWith(
        expectedMergedProduction,
      );
      expect(result).toEqual(expectedMergedProduction);
    });

    it("should throw an error if the production to modify does not exist", async () => {
      const patchData: UpdateProductionDto = { titel: "Patched titel" };

      // Simulate the database failing to find the record
      jest
        .spyOn(dbService, "getProductionById")
        .mockRejectedValueOnce(
          new Error("No ProductionDto exists for provided ID"),
        );

      // The service should halt and bubble up the fetch error, never calling updateProduction
      await expect(service.modifyProduction(999, patchData)).rejects.toThrow(
        "No ProductionDto exists for provided ID",
      );
      expect(dbService.updateProduction).not.toHaveBeenCalled();
    });
  });

  describe("deleteProduction", () => {
    it("should delete the production by id and return nothing", async () => {
      const result = await service.deleteProduction(1);
      expect(dbService.deleteProduction).toHaveBeenCalledWith(1);
      expect(result).toBeUndefined();
    });

    it("should handle database errors when deletion fails", async () => {
      // Simulate a database failure
      jest
        .spyOn(dbService, "deleteProduction")
        .mockRejectedValueOnce(new Error("Failed to delete record"));

      await expect(service.deleteProduction(999)).rejects.toThrow(
        "Failed to delete record",
      );
    });
  });

  describe("-- Blogs --", () => {
    const mockBlog: BlogDto = {
      id: 1,
      titel: "Behind the Scenes",
      description: "Looking at the set of The Great Show.",
    };

    describe("getProductionBlogs", () => {
      it("should return an array of blogs linked to a production", async () => {
        const expectedBlogs = [mockBlog];
        jest
          .spyOn(dbService, "getBlogsOfProduction")
          .mockResolvedValueOnce(expectedBlogs);

        const result = await service.getProductionBlogs(1);

        expect(result).toEqual(expectedBlogs);
        expect(dbService.getBlogsOfProduction).toHaveBeenCalledWith(1);
      });

      it("should handle errors if fetching blogs fails", async () => {
        jest
          .spyOn(dbService, "getBlogsOfProduction")
          .mockRejectedValueOnce(new Error("Database error"));

        await expect(service.getProductionBlogs(999)).rejects.toThrow(
          "Database error",
        );
      });
    });

    describe("linkBlogToProduction", () => {
      it("should link a blog and return the linked blog object", async () => {
        jest
          .spyOn(dbService, "linkBlogWithProductionID")
          .mockResolvedValueOnce(undefined);
        jest
          .spyOn(blogDbService, "getBlogById")
          .mockResolvedValueOnce(mockBlog);

        const result = await service.linkBlogToProduction(1, 2);

        expect(dbService.linkBlogWithProductionID).toHaveBeenCalledWith(2, 1); // blogId, productionId
        expect(blogDbService.getBlogById).toHaveBeenCalledWith(2);
        expect(result).toEqual(mockBlog);
      });

      it("should throw an error if the linking process fails", async () => {
        jest
          .spyOn(dbService, "linkBlogWithProductionID")
          .mockRejectedValueOnce(new Error("Failed to link"));

        await expect(service.linkBlogToProduction(1, 2)).rejects.toThrow(
          "Failed to link",
        );
        expect(blogDbService.getBlogById).not.toHaveBeenCalled();
      });
    });

    describe("unlinkBlogFromProduction", () => {
      it("should unlink a blog and return the unlinked production object", async () => {
        jest
          .spyOn(dbService, "deleteBlogFromProduction")
          .mockResolvedValueOnce(undefined);
        jest
          .spyOn(dbService, "getProductionById")
          .mockResolvedValueOnce(mockProduction);

        const result = await service.unlinkBlogFromProduction(1, 2);

        expect(dbService.deleteBlogFromProduction).toHaveBeenCalledWith(1, 2); // productionId, blogId
        expect(dbService.getProductionById).toHaveBeenCalledWith(1);
        expect(result).toEqual(mockProduction);
      });

      it("should throw an error if the unlinking process fails", async () => {
        jest
          .spyOn(dbService, "deleteBlogFromProduction")
          .mockRejectedValueOnce(new Error("Failed to unlink"));

        await expect(service.unlinkBlogFromProduction(1, 2)).rejects.toThrow(
          "Failed to unlink",
        );
        // Ensure it doesn't try to fetch the production if unlinking failed
        expect(dbService.getProductionById).not.toHaveBeenCalled();
      });
    });
  });

  describe("-- Tags --", () => {
    describe("getTagsById", () => {
      it("should fetch production and return its tags", async () => {
        const result = await service.getTagsById(1);
        expect(result).toEqual(mockTags);
        expect(dbService.getProductionById).toHaveBeenCalledWith(1);
        expect(dbService.getTagsOfProduction).toHaveBeenCalledWith(
          mockProduction,
        );
      });

      it("should call getProductionById with the correct id", async () => {
        await service.getTagsById(1);
        expect(dbService.getProductionById).toHaveBeenCalledWith(1);
        expect(dbService.getProductionById).toHaveBeenCalledTimes(1);
      });

      it("should call getTagsOfProduction with the fetched production", async () => {
        await service.getTagsById(1);
        expect(dbService.getTagsOfProduction).toHaveBeenCalledWith(
          mockProduction,
        );
        expect(dbService.getTagsOfProduction).toHaveBeenCalledTimes(1);
      });

      it("should return empty array when production has no tags", async () => {
        jest.spyOn(dbService, "getTagsOfProduction").mockResolvedValueOnce([]);
        const result = await service.getTagsById(1);
        expect(result).toEqual([]);
        expect(dbService.getProductionById).toHaveBeenCalledWith(1);
      });

      it("should handle database error when production is not found", async () => {
        jest
          .spyOn(dbService, "getProductionById")
          .mockRejectedValueOnce(
            new Error("No ProductionDto exists for provided ID"),
          );

        await expect(service.getTagsById(999)).rejects.toThrow(
          "No ProductionDto exists for provided ID",
        );
        expect(dbService.getTagsOfProduction).not.toHaveBeenCalled();
      });

      it("should handle database error when fetching tags fails", async () => {
        jest
          .spyOn(dbService, "getTagsOfProduction")
          .mockRejectedValueOnce(new Error("Failed to fetch tags"));

        await expect(service.getTagsById(1)).rejects.toThrow(
          "Failed to fetch tags",
        );
        expect(dbService.getProductionById).toHaveBeenCalledWith(1);
      });
    });

    describe("addTagToProduction", () => {
      it("should silently attempt to add a tag and return the production object", async () => {
        jest
          .spyOn(dbService, "addTagToProduction")
          .mockResolvedValueOnce(undefined);
        jest
          .spyOn(dbService, "getProductionById")
          .mockResolvedValueOnce(mockProduction);

        const result = await service.addTagToProduction(1, 2);

        expect(dbService.addTagToProduction).toHaveBeenCalledWith(2, 1); // tagId, productionId
        expect(dbService.getProductionById).toHaveBeenCalledWith(1);
        expect(result).toEqual(mockProduction);
      });

      it("should handle failure when fetching the production to return fails", async () => {
        jest
          .spyOn(dbService, "addTagToProduction")
          .mockResolvedValueOnce(undefined);
        jest
          .spyOn(dbService, "getProductionById")
          .mockRejectedValueOnce(
            new Error("No ProductionDto exists for provided ID"),
          );

        await expect(service.addTagToProduction(999, 2)).rejects.toThrow(
          "No ProductionDto exists for provided ID",
        );
      });
    });

    describe("removeTagFromProduction", () => {
      it("should silently attempt to remove a tag and return the production object", async () => {
        jest
          .spyOn(dbService, "removeTagFromProduction")
          .mockResolvedValueOnce(undefined);
        jest
          .spyOn(dbService, "getProductionById")
          .mockResolvedValueOnce(mockProduction);

        const result = await service.removeTagFromProduction(1, 2);

        expect(dbService.removeTagFromProduction).toHaveBeenCalledWith(2, 1); // tagId, productionId
        expect(dbService.getProductionById).toHaveBeenCalledWith(1);
        expect(result).toEqual(mockProduction);
      });

      it("should handle failure when fetching the production to return fails", async () => {
        jest
          .spyOn(dbService, "removeTagFromProduction")
          .mockResolvedValueOnce(undefined);
        jest
          .spyOn(dbService, "getProductionById")
          .mockRejectedValueOnce(
            new Error("No ProductionDto exists for provided ID"),
          );

        await expect(service.removeTagFromProduction(999, 2)).rejects.toThrow(
          "No ProductionDto exists for provided ID",
        );
      });
    });
  });

  describe("createProduction", () => {
    it("should create a production successfully", async () => {
      const newProduction: CreateProductionDto = {
        titel: "New Show",
        ondertitel: "Exciting",
        description1: "Awesome description",
        description2: "Even more awesome",
        genre: "Comedy",
        planning_id: 2,
      };

      const createdProduction: ProductionDto = { id: 2, ...newProduction };

      jest
        .spyOn(dbService, "createProduction")
        .mockResolvedValueOnce(createdProduction);

      const result = await service.createProduction(newProduction);

      expect(dbService.createProduction).toHaveBeenCalledWith(newProduction);
      expect(result).toEqual(createdProduction);
    });

    it("should handle database errors when creation fails", async () => {
      const newProduction: CreateProductionDto = {
        titel: "New Show",
        ondertitel: "Exciting",
        description1: "Awesome description",
        description2: "Even more awesome",
        genre: "Comedy",
        planning_id: 2,
      };

      jest
        .spyOn(dbService, "createProduction")
        .mockRejectedValueOnce(new Error("Failed to create production"));

      await expect(service.createProduction(newProduction)).rejects.toThrow(
        "Failed to create production",
      );
    });
  });
});
