import { Test, TestingModule } from "@nestjs/testing";
import { BlogService } from "./blog.service";
import { BlogDatabaseService } from "../database/db.blog.service";
import {
  BlogDto,
  CreateBlogDto,
  PaginationFilterDto,
  ModifyBlogDto,
} from "../dto/dto";
import { FilterBlog } from "@repo/common";

describe("BlogService", () => {
  let service: BlogService;
  let blogDbService: BlogDatabaseService;

  // 1. Create a mock database service
  const mockBlogDbService = {
    getBlogs: jest.fn(),
    getBlogById: jest.fn(),
    createBlog: jest.fn(),
    updateBlog: jest.fn(),
    deleteBlog: jest.fn(),
    getMediaFromBlog: jest.fn(),
    linkMediaToBlog: jest.fn(),
    unlinkMediaFromBlog: jest.fn(),
  };

  // Sample data for testing
  const mockBlog: BlogDto = {
    id: 1,
    titel: {
      en: "Behind the Scenes",
      nl: "Achter de schermen",
    },
    description: {
      en: "Looking at the set of The Great Show.",
      nl: "Kijken naar de set van The Great Show",
    },
    created_at: "2025-06-01T22:00:00.000Z",
    updated_at: "2025-06-01T22:00:00.000Z",
  };

  const filter: PaginationFilterDto = {
    limit: 10,
    page: 1,
    descending: false,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogService,
        // 2. Provide the mock instead of the real service
        {
          provide: BlogDatabaseService,
          useValue: mockBlogDbService,
        },
      ],
    }).compile();

    service = module.get<BlogService>(BlogService);
    blogDbService = module.get<BlogDatabaseService>(BlogDatabaseService);
  });

  // Clear mock history before each test to prevent cross-test contamination
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Initialization", () => {
    it("should be defined", () => {
      expect(service).toBeDefined();
    });
  });

  describe("getAllBlogs", () => {
    it("should return an array of blogs", async () => {
      const expectedBlogs = [mockBlog];
      const blogFilters: FilterBlog = {
        is_suggestion: false,
      };
      mockBlogDbService.getBlogs.mockResolvedValue(expectedBlogs);

      const result = await service.getAllBlogs(filter, blogFilters);

      expect(result).toEqual(expectedBlogs);
      expect(blogDbService.getBlogs).toHaveBeenCalledTimes(1);
    });
  });

  describe("getBlogById", () => {
    it("should return a single blog", async () => {
      mockBlogDbService.getBlogById.mockResolvedValue(mockBlog);

      const result = await service.getBlogById(1);

      expect(result).toEqual(mockBlog);
      expect(blogDbService.getBlogById).toHaveBeenCalledWith(1);
    });
  });

  describe("createBlog", () => {
    it("should create and return a new blog", async () => {
      const createDto: CreateBlogDto = {
        titel: {
          en: "My First Blog",
          nl: "Mijn eerste blog",
        },
        description: {
          en: "Hello World!",
          nl: "Hallo Wereld!",
        },
      };
      mockBlogDbService.createBlog.mockResolvedValue(mockBlog);

      const result = await service.createBlog(createDto);

      expect(result).toEqual(mockBlog);
      expect(blogDbService.createBlog).toHaveBeenCalledWith(createDto);
    });
  });

  describe("replaceBlog", () => {
    it("should replace and return the blog when IDs match", async () => {
      const replaceDto: BlogDto = { ...mockBlog };
      mockBlogDbService.updateBlog.mockResolvedValue(mockBlog);

      const result = await service.replaceBlog(1, replaceDto);

      expect(result).toEqual(mockBlog);
      expect(blogDbService.updateBlog).toHaveBeenCalledWith(1, replaceDto);
    });
  });

  describe("modifyBlog", () => {
    it("should assign the ID to the DTO and update the blog", async () => {
      const updateDto: ModifyBlogDto = {
        titel: {
          en: "Updated titel",
          nl: "Bijgewerkte titel",
        },
      };
      const expectedUpdatedBlog = {
        ...mockBlog,
        titel: {
          en: "Updated titel",
          nl: "Bijgewerkte titel",
        },
      };

      mockBlogDbService.updateBlog.mockResolvedValue(expectedUpdatedBlog);

      const result = await service.modifyBlog(1, updateDto);

      expect(result).toEqual(expectedUpdatedBlog);
      // Validate that the ID was injected into the DTO before calling the DB
      expect(blogDbService.updateBlog).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe("deleteBlog", () => {
    it("should call delete on the database service", async () => {
      mockBlogDbService.deleteBlog.mockResolvedValue(undefined);

      await service.deleteBlog(1);

      expect(blogDbService.deleteBlog).toHaveBeenCalledWith(1);
      expect(blogDbService.deleteBlog).toHaveBeenCalledTimes(1);
    });
  });

  describe("-- Media --", () => {
    const mockMediaGallery = {
      id: 1,
      name: "Blog Main Gallery",
      type: "default",
      created_at: "2025-06-01T22:00:00.000Z",
      updated_at: "2025-06-01T22:00:00.000Z",
    };

    describe("getBlogMedia", () => {
      it("should return the media gallery linked to a blog", async () => {
        mockBlogDbService.getMediaFromBlog.mockResolvedValueOnce(
          mockMediaGallery,
        );
        const result = await service.getMedia(1, "default");
        expect(result).toEqual(mockMediaGallery);
        expect(blogDbService.getMediaFromBlog).toHaveBeenCalledWith(
          1,
          "default",
        );
      });

      it("should handle errors if fetching media fails", async () => {
        mockBlogDbService.getMediaFromBlog.mockRejectedValueOnce(
          new Error("Database error"),
        );
        await expect(service.getMedia(999, "default")).rejects.toThrow(
          "Database error",
        );
      });
    });

    describe("linkMediaToBlog", () => {
      it("should link a media gallery to a blog successfully and return undefined", async () => {
        mockBlogDbService.linkMediaToBlog.mockResolvedValueOnce(undefined);
        const result = await service.linkMediaToBlog(1, 2);
        expect(blogDbService.linkMediaToBlog).toHaveBeenCalledWith(1, 2);
        expect(result).toBeUndefined();
      });

      it("should throw an error if the linking process fails", async () => {
        mockBlogDbService.linkMediaToBlog.mockRejectedValueOnce(
          new Error("Failed to link"),
        );
        await expect(service.linkMediaToBlog(1, 2)).rejects.toThrow(
          "Failed to link",
        );
      });
    });

    describe("unlinkMediaFromBlog", () => {
      it("should unlink a media gallery from a blog successfully and return undefined", async () => {
        mockBlogDbService.unlinkMediaFromBlog.mockResolvedValueOnce(undefined);
        const result = await service.unlinkMediaFromBlog(1, 2);
        expect(mockBlogDbService.unlinkMediaFromBlog).toHaveBeenCalledWith(
          1,
          2,
        );
        expect(result).toBeUndefined();
      });

      it("should throw an error if the unlinking process fails", async () => {
        mockBlogDbService.unlinkMediaFromBlog.mockRejectedValueOnce(
          new Error("Failed to unlink"),
        );
        await expect(service.unlinkMediaFromBlog(1, 2)).rejects.toThrow(
          "Failed to unlink",
        );
      });
    });
  });
});
