import { Test, TestingModule } from "@nestjs/testing";
import { BlogController } from "./blog.controller";
import { BlogService } from "./blog.service";
import { BlogDto, CreateBlogDto, UpdateBlogDto } from "../dto/dto";

describe("BlogController", () => {
  let controller: BlogController;
  let blogService: BlogService;

  // 1. Create a mock for the BlogService
  const mockBlogService = {
    getAllBlogs: jest.fn(),
    getBlogById: jest.fn(),
    createBlog: jest.fn(),
    replaceBlog: jest.fn(),
    modifyBlog: jest.fn(),
    deleteBlog: jest.fn(),
  };

  // Sample data for assertions
  const mockBlog: BlogDto = {
    id: 1,
    titel: "My First Blog",
    description: "Hello World!",
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlogController],
      providers: [
        // 2. Inject the mock service
        {
          provide: BlogService,
          useValue: mockBlogService,
        },
      ],
    }).compile();

    controller = module.get<BlogController>(BlogController);
    blogService = module.get<BlogService>(BlogService);
  });

  // Clear mock history before each test
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Initialization", () => {
    it("should be defined", () => {
      expect(controller).toBeDefined();
    });
  });

  describe("getAllBlogs", () => {
    it("should return an array of blogs", async () => {
      const expectedBlogs = [mockBlog];
      mockBlogService.getAllBlogs.mockResolvedValue(expectedBlogs);

      const result = await controller.getAllBlogs();

      expect(result).toEqual(expectedBlogs);
      expect(blogService.getAllBlogs).toHaveBeenCalledTimes(1);
    });
  });

  describe("getBlogById", () => {
    it("should return a single blog by ID", async () => {
      const blogId = 1;
      mockBlogService.getBlogById.mockResolvedValue(mockBlog);

      const result = await controller.getBlogById(blogId);

      expect(result).toEqual(mockBlog);
      expect(blogService.getBlogById).toHaveBeenCalledWith(blogId);
      expect(blogService.getBlogById).toHaveBeenCalledTimes(1);
    });
  });

  describe("createBlog", () => {
    it("should create and return a new blog", async () => {
      const createDto: CreateBlogDto = {
        titel: "My First Blog",
        description: "Hello World!",
      };
      mockBlogService.createBlog.mockResolvedValue(mockBlog);

      const result = await controller.createBlog(createDto);

      expect(result).toEqual(mockBlog);
      expect(blogService.createBlog).toHaveBeenCalledWith(createDto);
      expect(blogService.createBlog).toHaveBeenCalledTimes(1);
    });
  });

  describe("replaceBlog", () => {
    it("should replace and return the updated blog", async () => {
      const blogId = 1;
      const replaceDto: BlogDto = { ...mockBlog };
      mockBlogService.replaceBlog.mockResolvedValue(mockBlog);

      const result = await controller.replaceBlog(blogId, replaceDto);

      expect(result).toEqual(mockBlog);
      expect(blogService.replaceBlog).toHaveBeenCalledWith(blogId, replaceDto);
      expect(blogService.replaceBlog).toHaveBeenCalledTimes(1);
    });
  });

  describe("modifyBlog", () => {
    it("should modify and return the updated blog", async () => {
      const blogId = 1;
      const updateDto: UpdateBlogDto = { titel: "Updated titel" };
      const expectedUpdatedBlog = { ...mockBlog, titel: "Updated titel" };

      mockBlogService.modifyBlog.mockResolvedValue(expectedUpdatedBlog);

      const result = await controller.modifyBlog(blogId, updateDto);

      expect(result).toEqual(expectedUpdatedBlog);
      expect(blogService.modifyBlog).toHaveBeenCalledWith(blogId, updateDto);
      expect(blogService.modifyBlog).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteBlog", () => {
    it("should successfully delete a blog", async () => {
      const blogId = 1;
      mockBlogService.deleteBlog.mockResolvedValue(undefined);

      await controller.deleteBlog(blogId);

      expect(blogService.deleteBlog).toHaveBeenCalledWith(blogId);
      expect(blogService.deleteBlog).toHaveBeenCalledTimes(1);
    });
  });
});
