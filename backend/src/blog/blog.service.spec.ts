import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException } from "@nestjs/common";
import { BlogService } from "./blog.service";
import { BlogDatabaseService } from "../database/db.blog.service";
import { BlogDto, CreateBlogDto, UpdateBlogDto } from "../dto/dto";

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
    titel: "My First Blog",
    description: "Hello World!",
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
      mockBlogDbService.getBlogs.mockResolvedValue(expectedBlogs);

      const result = await service.getAllBlogs();

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
        titel: "My First Blog",
        description: "Hello World!",
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
      expect(blogDbService.updateBlog).toHaveBeenCalledWith(replaceDto);
    });

    it("should throw a BadRequestException when IDs do not match", async () => {
      const replaceDto: BlogDto = { ...mockBlog, id: 2 }; // ID mismatch here

      // We expect the promise to reject with the specific exception
      await expect(service.replaceBlog(1, replaceDto)).rejects.toThrow(
        BadRequestException,
      );

      await expect(service.replaceBlog(1, replaceDto)).rejects.toThrow(
        "Blog ID and URL ID do not match. Cannot replace Blog.",
      );

      // Ensure the database service was never called
      expect(blogDbService.updateBlog).not.toHaveBeenCalled();
    });
  });

  describe("modifyBlog", () => {
    it("should assign the ID to the DTO and update the blog", async () => {
      const updateDto: UpdateBlogDto = { titel: "Updated titel" };
      const expectedUpdatedBlog = { ...mockBlog, titel: "Updated titel" };

      mockBlogDbService.updateBlog.mockResolvedValue(expectedUpdatedBlog);

      const result = await service.modifyBlog(1, updateDto);

      expect(result).toEqual(expectedUpdatedBlog);
      // Validate that the ID was injected into the DTO before calling the DB
      expect(blogDbService.updateBlog).toHaveBeenCalledWith({
        id: 1,
        titel: "Updated titel",
      });
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
