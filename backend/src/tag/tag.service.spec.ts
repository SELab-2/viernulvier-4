import { Test, TestingModule } from "@nestjs/testing";
import { TagService } from "./tag.service";
import { TagDatabaseService } from "../database/db.tag.service";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import {
  CreateTagDto,
  PaginationFilterDto,
  TagDto,
  UpdateTagDto,
} from "../dto/dto";

describe("TagService", () => {
  let service: TagService;
  let dbService: TagDatabaseService;

  // Updated to match localized TagSchema (removed old production_id)
  const mockTag: TagDto = {
    id: 1,
    tag: {
      en: "Action",
      nl: "Actie",
    },
    created_at: "2024-01-15T19:00:00.000Z",
    updated_at: "2024-01-15T19:00:00.000Z",
    legacy_id: null,
  };

  const filter: PaginationFilterDto = {
    limit: 10,
    page: 1,
  };

  const mockTags: TagDto[] = [mockTag];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TagService,
        {
          provide: TagDatabaseService,
          useValue: {
            createTag: jest.fn().mockResolvedValue(mockTag),
            getTagById: jest.fn().mockResolvedValue(mockTag),
            getTags: jest.fn().mockResolvedValue(mockTags),
            updateTag: jest.fn().mockResolvedValue(mockTag),
            deleteTag: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<TagService>(TagService);
    dbService = module.get<TagDatabaseService>(TagDatabaseService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("createTag", () => {
    it("should create and return a new tag", async () => {
      const createDto: CreateTagDto = {
        tag: { en: "NewTag", nl: "NieuweTag" },
        legacy_id: null,
      };
      const result = await service.createTag(createDto);
      expect(dbService.createTag).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockTag);
    });
  });

  describe("getTagById", () => {
    it("should return tag by id from database", async () => {
      const result = await service.getTagById(1);
      expect(result).toEqual(mockTag);
      expect(dbService.getTagById).toHaveBeenCalledWith(1);
    });

    it("should throw NotFoundException if tag does not exist", async () => {
      jest
        .spyOn(dbService, "getTagById")
        .mockRejectedValue(new NotFoundException());
      await expect(service.getTagById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe("getAllTags", () => {
    it("should return all tags from database", async () => {
      const result = await service.getAllTags(filter);
      expect(result).toEqual(mockTags);
      expect(dbService.getTags).toHaveBeenCalled();
    });

    it("should handle database errors", async () => {
      jest
        .spyOn(dbService, "getTags")
        .mockRejectedValue(new Error("Database error"));
      await expect(service.getAllTags(filter)).rejects.toThrow(
        "Database error",
      );
    });
  });

  describe("updateTag", () => {
    it("should successfully update and return the tag", async () => {
      const updateDto: UpdateTagDto = {
        tag: { en: "Updated", nl: "Bijgewerkt" },
      };
      const result = await service.updateTag(1, updateDto);
      expect(dbService.updateTag).toHaveBeenCalledWith(updateDto);
      expect(result).toEqual(mockTag);
    });

    it("should throw BadRequestException if url id and body id do not match", async () => {
      const mismatchDto: UpdateTagDto = {
        id: 2,
        tag: { en: "Mismatch", nl: "Mismatch" },
      };
      await expect(service.updateTag(1, mismatchDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe("deleteTag", () => {
    it("should delete the tag and return a success message", async () => {
      const result = await service.deleteTag(1);
      expect(dbService.deleteTag).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        message: `Tag with ID 1 has been removed successfully.`,
      });
    });
  });
});
