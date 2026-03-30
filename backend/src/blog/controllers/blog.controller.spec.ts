import { Test, TestingModule } from "@nestjs/testing";
import { BlogController } from "./blog.controller";
import { BlogService } from "../blog.service";
import { LanguageService } from "../../util/language/language.service";
import {
  BlogDto,
  BlogViewDto,
  CreateBlogDto,
  LanguageQueryDto,
  PaginationFilterDto,
  ModifyBlogDto,
} from "../../dto/dto";
import { ApiKeyGuard, SuperApiKeyGuard } from "../../auth/authGuard";
import { FilterBlog } from "@repo/common";

describe("BlogController", () => {
  let controller: BlogController;
  let blogService: BlogService;
  let languageService: LanguageService;

  // 1. Create a mock for the BlogService
  const mockBlogService = {
    getAllBlogs: jest.fn(),
    getBlogById: jest.fn(),
    createBlog: jest.fn(),
    replaceBlog: jest.fn(),
    modifyBlog: jest.fn(),
    deleteBlog: jest.fn(),
  };

  // 2. Create a mock for the LanguageService
  const mockLanguageService = {
    flattenByLanguage: jest.fn(),
  };

  // Raw blog data from the service
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

  // Flattened blog data expected from the language service
  const mockBlogView: BlogViewDto = {
    id: 1,
    titel: "Behind the Scenes",
    description: "Looking at the set of The Great Show.",
    created_at: "2025-06-01T22:00:00.000Z",
    updated_at: "2025-06-01T22:00:00.000Z",
  };

  const filter: PaginationFilterDto = {
    limit: 10,
    page: 1,
    descending: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlogController],
      providers: [
        {
          provide: BlogService,
          useValue: mockBlogService,
        },
        {
          provide: LanguageService,
          useValue: mockLanguageService,
        },
      ],
    })
      .overrideGuard(ApiKeyGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .overrideGuard(SuperApiKeyGuard)
      .useValue({
        canActivate: jest.fn(() => true),
      })
      .compile();

    controller = module.get<BlogController>(BlogController);
    blogService = module.get<BlogService>(BlogService);
    languageService = module.get<LanguageService>(LanguageService);
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
    it("should return an array of blogs flattened by language into BlogViewDto", async () => {
      const rawBlogs = [mockBlog];
      const flattenedBlogs = [mockBlogView];
      const langQuery: LanguageQueryDto = { lang: "en" };
      const blogFilters: FilterBlog = {};

      mockBlogService.getAllBlogs.mockResolvedValue(rawBlogs);
      mockLanguageService.flattenByLanguage.mockReturnValue(flattenedBlogs);

      const result = await controller.getAllBlogs(
        filter,
        langQuery,
        blogFilters,
      );

      expect(result).toEqual(flattenedBlogs);
      expect(blogService.getAllBlogs).toHaveBeenCalledTimes(1);
      expect(languageService.flattenByLanguage).toHaveBeenCalledWith(
        rawBlogs,
        langQuery.lang,
      );
    });
  });

  describe("getBlogById", () => {
    it("should return a single blog flattened by language into BlogViewDto", async () => {
      const blogId = 1;
      const langQuery: LanguageQueryDto = { lang: "en" };

      mockBlogService.getBlogById.mockResolvedValue(mockBlog);
      mockLanguageService.flattenByLanguage.mockReturnValue(mockBlogView);

      const result = await controller.getBlogById(blogId, langQuery);

      expect(result).toEqual(mockBlogView);
      expect(blogService.getBlogById).toHaveBeenCalledWith(blogId);
      expect(blogService.getBlogById).toHaveBeenCalledTimes(1);
      expect(languageService.flattenByLanguage).toHaveBeenCalledWith(
        mockBlog,
        langQuery.lang,
      );
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
