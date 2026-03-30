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
      const blogFilters: FilterBlog = {};
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
});
