import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { BlogDatabaseService } from "../src/database/db.blog.service";
import { EventDatabaseService } from "../src/database/db.event.service";
import { ProductionDatabaseService } from "../src/database/db.production.service";
import { TagDatabaseService } from "../src/database/db.tag.service";
import { LocationDatabaseService } from "../src/database/db.location.service";
import { PriceDatabaseService } from "../src/database/db.price.service";
import request from "supertest";
import { ApiKeyGuard } from "../src/auth/authGuard";
import { AppLogger } from "../src/util/logger/logger.service";
import { ScraperService } from "../src/util/scraper/scraper.service";
import { MediaCropDatabaseService } from "../src/database/media/db.media_crop.service";
import { MediaItemDatabaseService } from "../src/database/media/db.media_item.service";
import { MediaGalleryDatabaseService } from "../src/database/media/db.media_gallery.service";
import { AppModule } from "../src/app.module";
import { MediaStorageService } from "../src/media/media_storage/service/media_storage.service";

// ==========================================
// MOCK DATA (Raw & View Variants)
// ==========================================

const mockBlog = {
  id: 1,
  titel: { en: "Test Blog", nl: "Test Blog" },
  description: { en: "Test blog description", nl: "Test blog beschrijving" },
  created_at: "2025-06-01T22:00:00.000Z",
  updated_at: "2025-06-01T22:00:00.000Z",
};
const mockBlogView = {
  ...mockBlog,
  titel: "Test Blog",
  description: "Test blog description",
};

const mockBlog2 = {
  id: 2,
  titel: { en: "Second Blog", nl: "Tweede Blog" },
  description: {
    en: "Second blog description",
    nl: "Tweede blog beschrijving",
  },
  created_at: "2026-03-08T00:00:00.000Z",
  updated_at: "2026-03-08T00:00:00.000Z",
};
const mockBlog2View = {
  ...mockBlog2,
  titel: "Second Blog",
  description: "Second blog description",
};

const mockTag = {
  id: 1,
  tag: { en: "Drama", nl: "Drama" },
  created_at: "2025-06-01T22:00:00.000Z",
  updated_at: "2025-06-01T22:00:00.000Z",
};
const mockTagView = { ...mockTag, tag: "Drama" };

const mockTag2 = {
  id: 2,
  tag: { en: "Comedy", nl: "Komedie" },
  created_at: "2025-06-01T22:00:00.000Z",
  updated_at: "2025-06-01T22:00:00.000Z",
};
const mockTag2View = { ...mockTag2, tag: "Comedy" };

const mockProduction = {
  id: 1,
  titel: { en: "str", nl: "str" },
  description1: { en: "string", nl: "string" },
  description2: { en: "string", nl: "string" },
  artist: { en: "string", nl: "string" },
  tagline: { en: "string", nl: "string" },
  credits: { en: "string", nl: "string" },
  performer_type: "string",
  attendance_mode: "string",
  created_at: "2026-03-07T16:58:08.701Z",
  updated_at: "2026-03-07T16:58:08.701Z",
};
const mockProductionView = {
  ...mockProduction,
  titel: "str",
  description1: "string",
  description2: "string",
  artist: "string",
  tagline: "string",
  credits: "string",
};

const mockEvent = {
  id: 1,
  starttime: "2025-01-01T19:00:00.000Z",
  endtime: "2025-01-01T22:00:00.000Z",
  doors_at: "2025-06-01T22:00:00.000Z",
  intermission_at: "2025-06-01T22:00:00.000Z",
  created_at: "2026-03-07T00:00:00.000Z",
  updated_at: "2026-03-07T00:00:00.000Z",
  production_id: 1,
};

const mockLocation = {
  id: 1,
  location: { en: "Main Stage", nl: "Hoofdpodium" },
  created_at: "2025-06-01T22:00:00.000Z",
  updated_at: "2025-06-01T22:00:00.000Z",
};
const mockLocationView = { ...mockLocation, location: "Main Stage" };

const mockPrice = {
  id: 1,
  price: 15.5,
  name: { en: "Early Bird", nl: "Vroege Vogel" },
  created_at: "2025-06-01T22:00:00.000Z",
  updated_at: "2025-06-01T22:00:00.000Z",
};
const mockPriceView = { ...mockPrice, name: "Early Bird" };

// ==========================================
// Mock DB service factories
// ==========================================

const mockLocationDbService = () => ({
  getLocations: jest.fn().mockResolvedValue([mockLocation]),
  getLocationById: jest.fn().mockResolvedValue(mockLocation),
  createLocation: jest.fn().mockResolvedValue(mockLocation),
  updateLocation: jest.fn().mockResolvedValue(mockLocation),
  deleteLocation: jest.fn().mockResolvedValue(undefined),
});

const mockBlogDbService = () => ({
  getBlogs: jest.fn().mockResolvedValue([mockBlog, mockBlog2]),
  getBlogById: jest.fn().mockResolvedValue(mockBlog),
  createBlog: jest.fn().mockResolvedValue(mockBlog),
  updateBlog: jest.fn().mockResolvedValue(mockBlog),
  deleteBlog: jest.fn().mockResolvedValue(undefined),
});

const mockEventDbService = () => ({
  getEvents: jest.fn().mockResolvedValue([mockEvent]),
  getEventById: jest.fn().mockResolvedValue(mockEvent),
  createEvent: jest.fn().mockResolvedValue(mockEvent),
  updateEvent: jest.fn().mockResolvedValue(mockEvent),
  deleteEvent: jest.fn().mockResolvedValue(undefined),
  getBlogsOfEvent: jest.fn().mockResolvedValue([mockBlog]),
  linkBlogWithEventID: jest.fn().mockResolvedValue(undefined),
  deleteBlogFromEvent: jest.fn().mockResolvedValue(undefined),
  getLocationOfEvent: jest.fn().mockResolvedValue(mockLocation),
  linkEventToLocation: jest.fn().mockResolvedValue(true),
  deleteLocationFromEvent: jest.fn().mockResolvedValue(undefined),
  getPricesOfEvent: jest.fn().mockResolvedValue([mockPrice]),
  addPriceToEvent: jest.fn().mockResolvedValue(true),
  removePriceFromEvent: jest.fn().mockResolvedValue(undefined),
});

const mockProductionDbService = () => ({
  getProductions: jest.fn().mockResolvedValue([mockProduction]),
  getProductionById: jest.fn().mockResolvedValue(mockProduction),
  createProduction: jest.fn().mockResolvedValue(mockProduction),
  updateProduction: jest.fn().mockResolvedValue(mockProduction),
  upsertProduction: jest.fn().mockResolvedValue(mockProduction),
  deleteProduction: jest.fn().mockResolvedValue(undefined),
  getBlogsOfProduction: jest.fn().mockResolvedValue([mockBlog]),
  linkBlogWithProductionID: jest.fn().mockResolvedValue(undefined),
  deleteBlogFromProduction: jest.fn().mockResolvedValue(undefined),
  getTagsOfProduction: jest.fn().mockResolvedValue([mockTag]),
  addTagToProduction: jest.fn().mockResolvedValue(undefined),
  removeTagFromProduction: jest.fn().mockResolvedValue(undefined),
});

const mockTagDbService = () => ({
  getTags: jest.fn().mockResolvedValue([mockTag, mockTag2]),
  getTagById: jest.fn().mockResolvedValue(mockTag),
  createTag: jest.fn().mockResolvedValue(mockTag),
  updateTag: jest.fn().mockResolvedValue(mockTag),
  deleteTag: jest.fn().mockResolvedValue(undefined),
});

const mockPriceDbService = () => ({
  getPrices: jest.fn().mockResolvedValue([mockPrice]),
  getPriceById: jest.fn().mockResolvedValue(mockPrice),
  createPrice: jest.fn().mockResolvedValue(mockPrice),
  updatePrice: jest.fn().mockResolvedValue(mockPrice),
  deletePrice: jest.fn().mockResolvedValue(undefined),
});

// ==========================================
// MOCK DATA (Media)
// ==========================================

const mockMediaCrop = {
  id: 1,
  name: "hd_ready",
  url: "https://example.com/crop.jpg",
  created_at: "2026-03-28T14:00:00.000Z",
  updated_at: "2026-03-28T14:00:00.000Z",
};

const mockMediaItem = {
  id: 1,
  type: "image",
  original_filename: "test.png",
  position: "main",
  width: 1920,
  height: 1080,
  title: { en: "Test Media", nl: "Test Media" },
  description: { en: "Desc", nl: "Beschrijving" },
  credits: { en: "Credits", nl: "Credits" },
  created_at: "2026-03-28T14:00:00.000Z",
  updated_at: "2026-03-28T14:00:00.000Z",
};

const mockMediaItemView = {
  ...mockMediaItem,
  title: "Test Media",
  description: "Desc",
  credits: "Credits",
};

const mockMediaGallery = {
  id: 1,
  created_at: "2026-03-28T14:00:00.000Z",
  updated_at: "2026-03-28T14:00:00.000Z",
};

// @ts-ignore
const paginatedResponse = (objects) => ({
  objects,
  totalItems: 1,
  page: 1,
  limit: 10,
});

// ==========================================
// Mock DB service factory (Media)
// ==========================================

const mockMediaCropsDbService = () => ({
  getAllCrops: jest.fn().mockResolvedValue(paginatedResponse([mockMediaCrop])),
  getCropById: jest.fn().mockResolvedValue(mockMediaCrop),
  createCrop: jest.fn().mockResolvedValue(mockMediaCrop),
  updateCrop: jest.fn().mockResolvedValue(mockMediaCrop),
  deleteCrop: jest.fn().mockResolvedValue(undefined),
});

const mockMediaItemsDbService = () => ({
  getAllItems: jest.fn().mockResolvedValue(paginatedResponse([mockMediaItem])),
  getItemById: jest.fn().mockResolvedValue(mockMediaItem),
  createItem: jest.fn().mockResolvedValue(mockMediaItem),
  updateItem: jest.fn().mockResolvedValue(mockMediaItem),
  deleteItem: jest.fn().mockResolvedValue(undefined),
  getCropsByItem: jest.fn().mockResolvedValue([mockMediaCrop]),
  linkCropToItem: jest.fn().mockResolvedValue(undefined),
  unlinkCropFromItem: jest.fn().mockResolvedValue(undefined),
});

const mockMediaGalleryDbService = () => ({
  getGalleries: jest
    .fn()
    .mockResolvedValue(paginatedResponse([mockMediaGallery])),
  getGalleryById: jest.fn().mockResolvedValue(mockMediaGallery),
  createGallery: jest.fn().mockResolvedValue(mockMediaGallery),
  updateGallery: jest.fn().mockResolvedValue(mockMediaGallery),
  deleteGallery: jest.fn().mockResolvedValue(undefined),
  getItemsByGallery: jest.fn().mockResolvedValue([mockMediaItem]),
  linkItemToGallery: jest.fn().mockResolvedValue(undefined),
  unlinkItemFromGallery: jest.fn().mockResolvedValue(undefined),
});

// ==========================================
// Helper: build app with all modules
// ==========================================
async function buildApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideGuard(ApiKeyGuard)
    .useValue({ canActivate: jest.fn(() => true) })

    // Use .useValue() with the executed factory functions!
    .overrideProvider(BlogDatabaseService)
    .useValue(mockBlogDbService())
    .overrideProvider(EventDatabaseService)
    .useValue(mockEventDbService())
    .overrideProvider(ProductionDatabaseService)
    .useValue(mockProductionDbService())
    .overrideProvider(TagDatabaseService)
    .useValue(mockTagDbService())
    .overrideProvider(LocationDatabaseService)
    .useValue(mockLocationDbService())
    .overrideProvider(PriceDatabaseService)
    .useValue(mockPriceDbService())
    .overrideProvider(MediaItemDatabaseService)
    .useValue(mockMediaItemsDbService())
    .overrideProvider(MediaGalleryDatabaseService)
    .useValue(mockMediaGalleryDbService())
    .overrideProvider(MediaCropDatabaseService)
    .useValue(mockMediaCropsDbService())

    .overrideProvider(MediaStorageService)
    .useValue({
      save: jest.fn().mockResolvedValue("http://mock-url.com/image.jpg"),
      get: jest.fn().mockResolvedValue(Buffer.from("mock")),
      delete: jest.fn().mockResolvedValue(undefined),
    })
    .overrideProvider(AppLogger)
    .useValue({
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    })
    .overrideProvider(ScraperService)
    .useValue({
      onApplicationBootstrap: jest.fn(),
      handleDailyScrape: jest.fn(),
    })
    .compile();

  const app = moduleFixture.createNestApplication();
  app.useLogger(false);
  await app.init();
  return app;
}

// ==========================================
// BLOG endpoints
// ==========================================

describe("BlogController (e2e)", () => {
  let app: INestApplication;
  let blogDb: BlogDatabaseService;

  beforeEach(async () => {
    app = await buildApp();
    blogDb = app.get<BlogDatabaseService>(BlogDatabaseService);
  });

  afterEach(async () => {
    if (app) await app.close(); // <-- Safety check added everywhere
  });

  describe("GET /blogs", () => {
    it("should return 200 with an array of flattened blogs", () => {
      return request(app.getHttpServer())
        .get("/blogs?lang=en&descending=true")
        .expect(200)
        .expect([mockBlogView, mockBlog2View]);
    });

    it("should call blogDb.getBlogs()", async () => {
      await request(app.getHttpServer()).get("/blogs?lang=en&descending=true");
      expect(blogDb.getBlogs).toHaveBeenCalled();
    });

    it("should return 200 with an empty array when no blogs exist", async () => {
      // @ts-ignore
      jest.spyOn(blogDb, "getBlogs").mockResolvedValueOnce([]);
      return request(app.getHttpServer())
        .get("/blogs?lang=en&descending=true")
        .expect(200)
        .expect([]);
    });
  });

  describe("GET /blogs/:id", () => {
    it("should return 200 with the correct flattened blog", () => {
      return request(app.getHttpServer())
        .get("/blogs/1?lang=en")
        .expect(200)
        .expect(mockBlogView);
    });

    it("should call blogDb.getBlogById with the correct id", async () => {
      await request(app.getHttpServer()).get("/blogs/1?lang=en");
      expect(blogDb.getBlogById).toHaveBeenCalledWith(1);
    });

    it("should return 400 when id is not a number", () => {
      return request(app.getHttpServer()).get("/blogs/abc").expect(400);
    });

    it("should propagate errors from the database", async () => {
      jest
        .spyOn(blogDb, "getBlogById")
        .mockRejectedValueOnce(new Error("Not Found"));
      return request(app.getHttpServer()).get("/blogs/999?lang=en").expect(500);
    });
  });

  describe("POST /blogs", () => {
    const createPayload = {
      titel: { en: "New Blog", nl: "Nieuwe Blog" },
      description: { en: "New description", nl: "Nieuwe beschrijving" },
    };

    it("should return 201 with the created blog", () => {
      return request(app.getHttpServer())
        .post("/blogs")
        .send(createPayload)
        .expect(201)
        .expect(mockBlog);
    });

    it("should call blogDb.createBlog with the payload", async () => {
      await request(app.getHttpServer()).post("/blogs").send(createPayload);
      expect(blogDb.createBlog).toHaveBeenCalledWith(createPayload);
    });

    it("should return 400 when body is missing required fields", () => {
      return request(app.getHttpServer())
        .post("/blogs")
        .send({ titel: { en: "Only title" } })
        .expect(400);
    });
  });

  describe("PUT /blogs/:id", () => {
    it("should return 200 with the replaced blog when ids match", () => {
      return request(app.getHttpServer())
        .put("/blogs/1")
        .send(mockBlog)
        .expect(200)
        .expect(mockBlog);
    });

    it("should return 400 when id param is not a number", () => {
      return request(app.getHttpServer())
        .put("/blogs/abc")
        .send(mockBlog)
        .expect(400);
    });
  });

  describe("PATCH /blogs/:id", () => {
    it("should return 200 with the modified blog", () => {
      return request(app.getHttpServer())
        .patch("/blogs/1")
        .send({ titel: { en: "Updated title", nl: "Bijgewerkte titel" } })
        .expect(200)
        .expect(mockBlog);
    });

    it("should call blogDb.updateBlog", async () => {
      await request(app.getHttpServer())
        .patch("/blogs/1")
        .send({ titel: { en: "Updated title", nl: "Bijgewerkte titel" } });
      expect(blogDb.updateBlog).toHaveBeenCalled();
    });

    it("should return 400 when id is not a number", () => {
      return request(app.getHttpServer())
        .patch("/blogs/abc")
        .send({ titel: { en: "Updated title", nl: "Bijgewerkte titel" } })
        .expect(400);
    });
  });

  describe("DELETE /blogs/:id", () => {
    it("should return 200 when blog is deleted", () => {
      return request(app.getHttpServer()).delete("/blogs/1").expect(200);
    });

    it("should call blogDb.deleteBlog with the correct id", async () => {
      await request(app.getHttpServer()).delete("/blogs/1");
      expect(blogDb.deleteBlog).toHaveBeenCalledWith(1);
    });

    it("should return 400 when id is not a number", () => {
      return request(app.getHttpServer()).delete("/blogs/abc").expect(400);
    });
  });
});

// ==========================================
// TAG endpoints
// ==========================================

describe("TagController (e2e)", () => {
  let app: INestApplication;
  let tagDb: TagDatabaseService;

  beforeEach(async () => {
    app = await buildApp();
    tagDb = app.get<TagDatabaseService>(TagDatabaseService);
  });

  afterEach(async () => {
    if (app) await app.close();
  });

  describe("GET /tags", () => {
    it("should return 200 with an array of flattened tags", () => {
      return request(app.getHttpServer())
        .get("/tags?lang=en")
        .expect(200)
        .expect([mockTagView, mockTag2View]);
    });

    it("should return 200 with empty array when no tags exist", async () => {
      // @ts-ignore
      jest.spyOn(tagDb, "getTags").mockResolvedValueOnce([]);
      return request(app.getHttpServer())
        .get("/tags?lang=en")
        .expect(200)
        .expect([]);
    });
  });

  describe("GET /tags/:id", () => {
    it("should return 200 with the correct flattened tag", () => {
      return request(app.getHttpServer())
        .get("/tags/1?lang=en")
        .expect(200)
        .expect(mockTagView);
    });

    it("should call tagDb.getTagById with the correct id", async () => {
      await request(app.getHttpServer()).get("/tags/1?lang=en");
      expect(tagDb.getTagById).toHaveBeenCalledWith(1);
    });

    it("should return 400 when id is not a number", () => {
      return request(app.getHttpServer()).get("/tags/abc").expect(400);
    });
  });

  describe("POST /tags", () => {
    const createPayload = {
      tag: { en: "Thriller", nl: "Thriller" },
    };

    it("should return 201 with the created tag", () => {
      return request(app.getHttpServer())
        .post("/tags")
        .send(createPayload)
        .expect(201)
        .expect(mockTag);
    });

    it("should call tagDb.createTag with the payload", async () => {
      await request(app.getHttpServer()).post("/tags").send(createPayload);
      expect(tagDb.createTag).toHaveBeenCalledWith(createPayload);
    });

    it("should return 400 when body is missing required field 'tag'", () => {
      return request(app.getHttpServer()).post("/tags").send({}).expect(400);
    });
  });

  describe("PATCH /tags/:id", () => {
    it("should return 200 with the updated tag", () => {
      return request(app.getHttpServer())
        .patch("/tags/1")
        .send({ tag: { en: "Thriller", nl: "Thriller" } })
        .expect(200)
        .expect(mockTag);
    });

    it("should return 400 when id is not a number", () => {
      return request(app.getHttpServer())
        .patch("/tags/abc")
        .send({ tag: { en: "Something", nl: "Iets" } })
        .expect(400);
    });
  });

  describe("DELETE /tags/:id", () => {
    it("should return 200 with a success message", async () => {
      const response = await request(app.getHttpServer())
        .delete("/tags/1")
        .expect(200);
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toContain("1");
    });

    it("should call tagDb.deleteTag with the correct id", async () => {
      await request(app.getHttpServer()).delete("/tags/1");
      expect(tagDb.deleteTag).toHaveBeenCalledWith(1);
    });

    it("should return 400 when id is not a number", () => {
      return request(app.getHttpServer()).delete("/tags/abc").expect(400);
    });
  });
});

// ==========================================
// PRODUCTION endpoints
// ==========================================

describe("ProductionController (e2e)", () => {
  let app: INestApplication;
  let productionDb: ProductionDatabaseService;

  beforeEach(async () => {
    app = await buildApp();
    productionDb = app.get<ProductionDatabaseService>(
      ProductionDatabaseService,
    );
  });

  afterEach(async () => {
    if (app) await app.close();
  });

  describe("GET /productions", () => {
    it("should return 200 with an array of flattened productions", () => {
      return request(app.getHttpServer())
        .get("/productions?lang=en")
        .expect(200)
        .expect([mockProductionView]);
    });

    it("should return 200 with empty array when no productions exist", async () => {
      // @ts-ignore
      jest.spyOn(productionDb, "getProductions").mockResolvedValueOnce([]);
      return request(app.getHttpServer())
        .get("/productions?lang=en")
        .expect(200)
        .expect([]);
    });
  });

  describe("GET /productions/:productionId", () => {
    it("should return 200 with the correct flattened production", () => {
      return request(app.getHttpServer())
        .get("/productions/1?lang=en")
        .expect(200)
        .expect(mockProductionView);
    });

    it("should call productionDb.getProductionById with the correct id", async () => {
      await request(app.getHttpServer()).get("/productions/1?lang=en");
      expect(productionDb.getProductionById).toHaveBeenCalledWith(1);
    });

    it("should return 400 when id is not a number", () => {
      return request(app.getHttpServer()).get("/productions/abc").expect(400);
    });
  });

  describe("POST /productions", () => {
    const createPayload = {
      titel: { en: "New Production", nl: "Nieuwe Productie" },
      description1: { en: "Desc 1", nl: "Beschrijving 1" },
      description2: { en: "Desc 2", nl: "Beschrijving 2" },
      attendance_mode: "etst",
      performer_type: "etst",
      tagline: { en: "test", nl: "test" },
      credits: { en: "test", nl: "test" },
      artist: { en: "test", nl: "test" },
    };

    it("should return 201 with the created production", () => {
      return request(app.getHttpServer())
        .post("/productions")
        .send(createPayload)
        .expect(201)
        .expect(mockProduction);
    });

    it("should call productionDb.createProduction with the payload", async () => {
      await request(app.getHttpServer())
        .post("/productions")
        .send(createPayload);
      expect(productionDb.createProduction).toHaveBeenCalledWith(createPayload);
    });

    it("should return 400 when required fields are missing", () => {
      return request(app.getHttpServer())
        .post("/productions")
        .send({ titel: { en: "Incomplete", nl: "Incompleet" } })
        .expect(400);
    });
  });

  describe("PUT /productions/:productionId", () => {
    it("should return 200 with the replaced production when ids match", () => {
      return request(app.getHttpServer())
        .put("/productions/1")
        .send(mockProduction)
        .expect(200)
        .expect(mockProduction);
    });

    it("should return 400 when id is not a number", () => {
      return request(app.getHttpServer())
        .put("/productions/abc")
        .send(mockProduction)
        .expect(400);
    });
  });

  describe("PATCH /productions/:productionId", () => {
    it("should return 200 with the modified production", () => {
      return request(app.getHttpServer())
        .patch("/productions/1")
        .send({ titel: { en: "Patched titel", nl: "Bijgewerkte titel" } })
        .expect(200)
        .expect(mockProduction);
    });

    it("should call productionDb.updateProduction", async () => {
      await request(app.getHttpServer())
        .patch("/productions/1")
        .send({ titel: { en: "Patched titel", nl: "Bijgewerkte titel" } });
      expect(productionDb.updateProduction).toHaveBeenCalled();
    });

    it("should return 400 when id is not a number", () => {
      return request(app.getHttpServer())
        .patch("/productions/abc")
        .send({ titel: { en: "Patched", nl: "Gepatched" } })
        .expect(400);
    });
  });

  describe("DELETE /productions/:productionId", () => {
    it("should return 200 when production is deleted", () => {
      return request(app.getHttpServer()).delete("/productions/1").expect(200);
    });

    it("should call productionDb.deleteProduction with the correct id", async () => {
      await request(app.getHttpServer()).delete("/productions/1");
      expect(productionDb.deleteProduction).toHaveBeenCalledWith(1);
    });

    it("should return 400 when id is not a number", () => {
      return request(app.getHttpServer())
        .delete("/productions/abc")
        .expect(400);
    });
  });
});

// ==========================================
// PRODUCTION - BLOG relationship endpoints
// ==========================================

describe("ProductionBlogController (e2e)", () => {
  let app: INestApplication;
  let productionDb: ProductionDatabaseService;

  beforeEach(async () => {
    app = await buildApp();
    productionDb = app.get<ProductionDatabaseService>(
      ProductionDatabaseService,
    );
  });

  afterEach(async () => {
    if (app) await app.close();
  });

  describe("GET /productions/:productionId/blogs", () => {
    it("should return 200 with flattened blogs linked to the production", () => {
      return request(app.getHttpServer())
        .get("/productions/1/blogs?lang=en")
        .expect(200)
        .expect([mockBlogView]);
    });

    it("should call productionDb.getBlogsOfProduction with the correct id", async () => {
      await request(app.getHttpServer()).get("/productions/1/blogs?lang=en");
      expect(productionDb.getBlogsOfProduction).toHaveBeenCalledWith(1);
    });

    it("should return 400 when productionId is not a number", () => {
      return request(app.getHttpServer())
        .get("/productions/abc/blogs")
        .expect(400);
    });
  });

  describe("PUT /productions/:productionId/blogs/:blogId", () => {
    it("should return 200 with the linked blog", () => {
      return request(app.getHttpServer())
        .put("/productions/1/blogs/1")
        .expect(200)
        .expect(mockBlog);
    });

    it("should call productionDb.linkBlogWithProductionID with correct ids", async () => {
      await request(app.getHttpServer()).put("/productions/1/blogs/2");
      expect(productionDb.linkBlogWithProductionID).toHaveBeenCalledWith(2, 1);
    });

    it("should return 400 when productionId is not a number", () => {
      return request(app.getHttpServer())
        .put("/productions/abc/blogs/1")
        .expect(400);
    });

    it("should return 400 when blogId is not a number", () => {
      return request(app.getHttpServer())
        .put("/productions/1/blogs/abc")
        .expect(400);
    });
  });

  describe("DELETE /productions/:productionId/blogs/:blogId", () => {
    it("should return 200 with the production after unlinking", () => {
      return request(app.getHttpServer())
        .delete("/productions/1/blogs/1")
        .expect(200)
        .expect(mockProduction);
    });

    it("should call productionDb.deleteBlogFromProduction with correct ids", async () => {
      await request(app.getHttpServer()).delete("/productions/1/blogs/2");
      expect(productionDb.deleteBlogFromProduction).toHaveBeenCalledWith(1, 2);
    });

    it("should return 400 when productionId is not a number", () => {
      return request(app.getHttpServer())
        .delete("/productions/abc/blogs/1")
        .expect(400);
    });
  });
});

// ==========================================
// PRODUCTION - TAG relationship endpoints
// ==========================================

describe("ProductionTagController (e2e)", () => {
  let app: INestApplication;
  let productionDb: ProductionDatabaseService;

  beforeEach(async () => {
    app = await buildApp();
    productionDb = app.get<ProductionDatabaseService>(
      ProductionDatabaseService,
    );
  });

  afterEach(async () => {
    if (app) await app.close();
  });

  describe("GET /productions/:productionId/tags", () => {
    it("should return 200 with flattened tags linked to the production", () => {
      return request(app.getHttpServer())
        .get("/productions/1/tags?lang=en")
        .expect(200)
        .expect([mockTagView]);
    });

    it("should call productionDb.getTagsOfProduction", async () => {
      await request(app.getHttpServer()).get("/productions/1/tags?lang=en");
      expect(productionDb.getTagsOfProduction).toHaveBeenCalled();
    });

    it("should return 400 when productionId is not a number", () => {
      return request(app.getHttpServer())
        .get("/productions/abc/tags")
        .expect(400);
    });
  });

  describe("PUT /productions/:productionId/tags/:tagId", () => {
    it("should return 200 with the production after adding tag", () => {
      return request(app.getHttpServer())
        .put("/productions/1/tags/1")
        .expect(200)
        .expect(mockProduction);
    });

    it("should call productionDb.addTagToProduction with correct ids", async () => {
      await request(app.getHttpServer()).put("/productions/1/tags/2");
      expect(productionDb.addTagToProduction).toHaveBeenCalledWith(2, 1);
    });

    it("should return 400 when productionId is not a number", () => {
      return request(app.getHttpServer())
        .put("/productions/abc/tags/1")
        .expect(400);
    });

    it("should return 400 when tagId is not a number", () => {
      return request(app.getHttpServer())
        .put("/productions/1/tags/abc")
        .expect(400);
    });
  });

  describe("DELETE /productions/:productionId/tags/:tagId", () => {
    it("should return 200 with the production after removing tag", () => {
      return request(app.getHttpServer())
        .delete("/productions/1/tags/1")
        .expect(200)
        .expect(mockProduction);
    });

    it("should call productionDb.removeTagFromProduction with correct ids", async () => {
      await request(app.getHttpServer()).delete("/productions/1/tags/2");
      expect(productionDb.removeTagFromProduction).toHaveBeenCalledWith(2, 1);
    });

    it("should return 400 when productionId is not a number", () => {
      return request(app.getHttpServer())
        .delete("/productions/abc/tags/1")
        .expect(400);
    });
  });
});

// ==========================================
// EVENT endpoints
// ==========================================

describe("EventController (e2e)", () => {
  let app: INestApplication;
  let eventDb: EventDatabaseService;

  beforeEach(async () => {
    app = await buildApp();
    eventDb = app.get<EventDatabaseService>(EventDatabaseService);
  });

  afterEach(async () => {
    if (app) await app.close();
  });

  describe("GET /events", () => {
    it("should return 200 with an array of events", () => {
      return request(app.getHttpServer())
        .get("/events")
        .expect(200)
        .expect([mockEvent]);
    });

    it("should return 200 with empty array when no events exist", async () => {
      // @ts-ignore
      jest.spyOn(eventDb, "getEvents").mockResolvedValueOnce([]);
      return request(app.getHttpServer()).get("/events").expect(200).expect([]);
    });
  });

  describe("GET /events/:id", () => {
    it("should return 200 with the correct event", () => {
      return request(app.getHttpServer())
        .get("/events/1")
        .expect(200)
        .expect(mockEvent);
    });

    it("should call eventDb.getEventById with the correct id", async () => {
      await request(app.getHttpServer()).get("/events/1");
      expect(eventDb.getEventById).toHaveBeenCalledWith(1);
    });

    it("should return 400 when id is not a number", () => {
      return request(app.getHttpServer()).get("/events/abc").expect(400);
    });
  });

  describe("POST /events", () => {
    const createPayload = {
      starttime: "2025-06-01T19:00:00.000Z",
      endtime: "2025-06-01T22:00:00.000Z",
      production_id: 1,
      doors_at: "2025-06-01T22:00:00.000Z",
      intermission_at: "2025-06-01T22:00:00.000Z",
    };

    it("should return 201 with the created event", () => {
      return request(app.getHttpServer())
        .post("/events")
        .send(createPayload)
        .expect(201)
        .expect(mockEvent);
    });

    it("should call eventDb.createEvent with the payload", async () => {
      await request(app.getHttpServer()).post("/events").send(createPayload);
      expect(eventDb.createEvent).toHaveBeenCalledWith(createPayload);
    });
  });

  describe("PUT /events/:id", () => {
    it("should return 200 with the replaced event when ids match", () => {
      return request(app.getHttpServer())
        .put("/events/1")
        .send(mockEvent)
        .expect(200)
        .expect(mockEvent);
    });

    it("should return 400 when id is not a number", () => {
      return request(app.getHttpServer())
        .put("/events/abc")
        .send(mockEvent)
        .expect(400);
    });
  });

  describe("PATCH /events/:id", () => {
    it("should return 200 with the modified event", () => {
      return request(app.getHttpServer())
        .patch("/events/1")
        .send({ production_id: 2 })
        .expect(200)
        .expect(mockEvent);
    });

    it("should call eventDb.updateEvent", async () => {
      await request(app.getHttpServer())
        .patch("/events/1")
        .send({ production_id: 2 });
      expect(eventDb.updateEvent).toHaveBeenCalled();
    });

    it("should return 400 when id is not a number", () => {
      return request(app.getHttpServer())
        .patch("/events/abc")
        .send({ production_id: 2 })
        .expect(400);
    });
  });

  describe("DELETE /events/:id", () => {
    it("should return 200 when event is deleted", () => {
      return request(app.getHttpServer()).delete("/events/1").expect(200);
    });

    it("should call eventDb.deleteEvent with the correct id", async () => {
      await request(app.getHttpServer()).delete("/events/1");
      expect(eventDb.deleteEvent).toHaveBeenCalledWith(1);
    });

    it("should return 400 when id is not a number", () => {
      return request(app.getHttpServer()).delete("/events/abc").expect(400);
    });
  });
});

// ==========================================
// LOCATION endpoints
// ==========================================

describe("LocationController (e2e)", () => {
  let app: INestApplication;
  let locationDb: LocationDatabaseService;

  beforeEach(async () => {
    app = await buildApp();
    locationDb = app.get<LocationDatabaseService>(LocationDatabaseService);
  });

  afterEach(async () => {
    if (app) await app.close();
  });

  describe("GET /locations", () => {
    it("should return 200 with an array of flattened locations", () => {
      return request(app.getHttpServer())
        .get("/locations?lang=en")
        .expect(200)
        .expect([mockLocationView]);
    });
  });

  describe("GET /locations/:locationId", () => {
    it("should return 200 with the correct flattened location", () => {
      return request(app.getHttpServer())
        .get("/locations/1?lang=en")
        .expect(200)
        .expect(mockLocationView);
    });

    it("should return 400 when locationId is not a number", () => {
      return request(app.getHttpServer()).get("/locations/abc").expect(400);
    });
  });

  describe("POST /locations", () => {
    it("should return 201 with the created location", () => {
      const createPayload = {
        location: { en: "Side Stage", nl: "Zijpodium" },
        legacy_id: "st",
      };
      return request(app.getHttpServer())
        .post("/locations")
        .send(createPayload)
        .expect(201)
        .expect(mockLocation);
    });
  });

  describe("PATCH /locations/:locationId", () => {
    it("should return 200 with the updated location", () => {
      const updatePayload = {
        id: 1,
        location: { en: "Updated Stage", nl: "Bijgewerkt podium" },
      };
      return request(app.getHttpServer())
        .patch("/locations/1")
        .send(updatePayload)
        .expect(200)
        .expect(mockLocation);
    });
  });

  describe("DELETE /locations/:locationId", () => {
    it("should return 200 after deleting location", () => {
      return request(app.getHttpServer()).delete("/locations/1").expect(200);
    });

    it("should return 400 when locationId is not a number", () => {
      return request(app.getHttpServer()).delete("/locations/abc").expect(400);
    });
  });
});

// ==========================================
// EVENT - LOCATION relationship endpoints
// ==========================================

describe("EventLocationController (e2e)", () => {
  let app: INestApplication;
  let eventDb: EventDatabaseService;

  beforeEach(async () => {
    app = await buildApp();
    eventDb = app.get<EventDatabaseService>(EventDatabaseService);
  });

  afterEach(async () => {
    if (app) await app.close();
  });

  describe("GET /events/:eventId/location", () => {
    it("should return 200 with the flattened location of the event", () => {
      return request(app.getHttpServer())
        .get("/events/1/location?lang=en")
        .expect(200)
        .expect(mockLocationView);
    });

    it("should call eventDb.getLocationOfEvent with the correct id", async () => {
      await request(app.getHttpServer()).get("/events/1/location?lang=en");
      expect(eventDb.getLocationOfEvent).toHaveBeenCalledWith(1);
    });

    it("should return 400 when eventId is not a number", () => {
      return request(app.getHttpServer())
        .get("/events/abc/location")
        .expect(400);
    });
  });

  describe("PUT /events/:eventId/location/:locationId", () => {
    it("should return 200 after successfully linking", () => {
      return request(app.getHttpServer())
        .put("/events/1/location/2")
        .expect(200);
    });

    it("should call eventDb.linkEventToLocation with correct ids", async () => {
      await request(app.getHttpServer()).put("/events/1/location/2");
      expect(eventDb.linkEventToLocation).toHaveBeenCalledWith(1, 2);
    });

    it("should return 400 when eventId is not a number", () => {
      return request(app.getHttpServer())
        .put("/events/abc/location/1")
        .expect(400);
    });

    it("should return 400 when locationId is not a number", () => {
      return request(app.getHttpServer())
        .put("/events/1/location/abc")
        .expect(400);
    });
  });

  describe("DELETE /events/:eventId/location", () => {
    it("should return 200 after unlinking", () => {
      return request(app.getHttpServer())
        .delete("/events/1/location")
        .expect(200);
    });

    it("should call eventDb.deleteLocationFromEvent with the eventId", async () => {
      await request(app.getHttpServer()).delete("/events/1/location");
      expect(eventDb.deleteLocationFromEvent).toHaveBeenCalledWith(1);
    });

    it("should return 400 when eventId is not a number", () => {
      return request(app.getHttpServer())
        .delete("/events/abc/location")
        .expect(400);
    });
  });
});

// ==========================================
// PRICE endpoints
// ==========================================

describe("PriceController (e2e)", () => {
  let app: INestApplication;
  let priceDb: PriceDatabaseService;

  beforeEach(async () => {
    app = await buildApp();
    priceDb = app.get<PriceDatabaseService>(PriceDatabaseService);
  });

  afterEach(async () => {
    if (app) await app.close();
  });

  describe("GET /prices", () => {
    it("should return 200 with an array of flattened prices", () => {
      return request(app.getHttpServer())
        .get("/prices?lang=en")
        .expect(200)
        .expect([mockPriceView]);
    });
  });

  describe("GET /prices/:priceId", () => {
    it("should return 200 with the correct flattened price", () => {
      return request(app.getHttpServer())
        .get("/prices/1?lang=en")
        .expect(200)
        .expect(mockPriceView);
    });

    it("should return 400 when priceId is not a number", () => {
      return request(app.getHttpServer()).get("/prices/abc").expect(400);
    });
  });

  describe("POST /prices", () => {
    it("should return 201 with the created price", () => {
      const createPayload = {
        price: 20.0,
        name: { en: "Standard", nl: "Standaard" },
        legacy_id: "",
      };
      return request(app.getHttpServer())
        .post("/prices")
        .send(createPayload)
        .expect(201)
        .expect(mockPrice);
    });
  });

  describe("PATCH /prices/:priceId", () => {
    it("should return 200 with the updated price", () => {
      const updatePayload = {
        id: 1,
        price: 25.0,
        name: { en: "Updated", nl: "Bijgewerkt" },
      };
      return request(app.getHttpServer())
        .patch("/prices/1")
        .send(updatePayload)
        .expect(200)
        .expect(mockPrice);
    });
  });

  describe("DELETE /prices/:priceId", () => {
    it("should return 200 after deleting price", () => {
      return request(app.getHttpServer()).delete("/prices/1").expect(200);
    });

    it("should call priceDb.deletePrice with correct id", async () => {
      await request(app.getHttpServer()).delete("/prices/1");
      expect(priceDb.deletePrice).toHaveBeenCalled();
    });
  });
});

// ==========================================
// EVENT - PRICE relationship endpoints
// ==========================================

describe("EventPriceController (e2e)", () => {
  let app: INestApplication;
  let eventDb: EventDatabaseService;

  beforeEach(async () => {
    app = await buildApp();
    eventDb = app.get<EventDatabaseService>(EventDatabaseService);
  });

  afterEach(async () => {
    if (app) await app.close();
  });

  describe("GET /events/:eventId/prices", () => {
    it("should return 200 with the flattened prices of the event", () => {
      return request(app.getHttpServer())
        .get("/events/1/prices?lang=en")
        .expect(200)
        .expect([mockPriceView]);
    });

    it("should call eventDb.getPricesOfEvent with the correct id", async () => {
      await request(app.getHttpServer()).get("/events/1/prices?lang=en");
      expect(eventDb.getPricesOfEvent).toHaveBeenCalledWith(1);
    });

    it("should return 400 when eventId is not a number", () => {
      return request(app.getHttpServer()).get("/events/abc/prices").expect(400);
    });
  });

  describe("PUT /events/:eventId/prices/:priceId", () => {
    it("should return 200 after successfully linking a price", () => {
      return request(app.getHttpServer())
        .put("/events/1/prices/100")
        .expect(200)
        .expect("true");
    });

    it("should call eventDb.addPriceToEvent with correct ids", async () => {
      await request(app.getHttpServer()).put("/events/1/prices/100");
      expect(eventDb.addPriceToEvent).toHaveBeenCalledWith(1, 100);
    });

    it("should return 400 when eventId is not a number", () => {
      return request(app.getHttpServer())
        .put("/events/abc/prices/100")
        .expect(400);
    });

    it("should return 400 when priceId is not a number", () => {
      return request(app.getHttpServer())
        .put("/events/1/prices/abc")
        .expect(400);
    });
  });

  describe("DELETE /events/:eventId/prices/:priceId", () => {
    it("should return 200 after unlinking a price", () => {
      return request(app.getHttpServer())
        .delete("/events/1/prices/100")
        .expect(200);
    });

    it("should call eventDb.removePriceFromEvent with correct ids", async () => {
      await request(app.getHttpServer()).delete("/events/1/prices/100");
      expect(eventDb.removePriceFromEvent).toHaveBeenCalledWith(1, 100);
    });

    it("should return 400 when eventId is not a number", () => {
      return request(app.getHttpServer())
        .delete("/events/abc/prices/100")
        .expect(400);
    });

    it("should return 400 when priceId is not a number", () => {
      return request(app.getHttpServer())
        .delete("/events/1/prices/abc")
        .expect(400);
    });
  });
});

// ==========================================
// MEDIA CROP endpoints
// ==========================================

describe("MediaCropController (e2e)", () => {
  let app: INestApplication;
  let mediaDb: MediaCropDatabaseService;

  beforeEach(async () => {
    app = await buildApp();
    mediaDb = app.get<MediaCropDatabaseService>(MediaCropDatabaseService);
  });

  afterEach(async () => {
    if (app) await app.close();
  });

  // 👇 ADDED /media/ prefix to ALL crops URLs 👇
  describe("GET /media/crops", () => {
    it("should return 200 with a paginated list of crops", () => {
      return request(app.getHttpServer())
        .get("/media/crops?page=1&limit=10")
        .expect(200)
        .expect(paginatedResponse([mockMediaCrop]));
    });
  });

  describe("GET /media/crops/:cropId", () => {
    it("should return 200 with the correct crop", () => {
      return request(app.getHttpServer())
        .get("/media/crops/1")
        .expect(200)
        .expect(mockMediaCrop);
    });
  });

  describe("POST /media/crops", () => {
    it("should return 201 with the created crop", async () => {
      const response = await request(app.getHttpServer())
        .post("/media/crops")
        .send({
          item_id: 1,
          name: "hd_ready",
          url: "https://test.com/a.jpg",
          autoDownload: 0,
        });

      if (response.status === 400) {
        console.log("Validation Error:", response.body);
      }

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockMediaCrop);
    });
  });

  describe("PUT /media/crops/:cropId", () => {
    it("should return 200 with the replaced crop", () => {
      return request(app.getHttpServer())
        .put("/media/crops/1")
        .send({ name: "hd_ready", url: "https://test.com/b.jpg" })
        .expect(200)
        .expect(mockMediaCrop);
    });
  });

  describe("PATCH /media/crops/:cropId", () => {
    it("should return 200 with the modified crop", () => {
      return request(app.getHttpServer())
        .patch("/media/crops/1")
        .send({ url: "https://test.com/new.jpg" })
        .expect(200)
        .expect(mockMediaCrop);
    });
  });

  describe("DELETE /media/crops/:cropId", () => {
    it("should return 200 after deleting crop", () => {
      return request(app.getHttpServer()).delete("/media/crops/1").expect(200);
    });
  });
});

// ==========================================
// MEDIA ITEM endpoints
// ==========================================

describe("MediaItemController (e2e)", () => {
  let app: INestApplication;
  let mediaDb: MediaItemDatabaseService;

  beforeEach(async () => {
    app = await buildApp();
    mediaDb = app.get<MediaItemDatabaseService>(MediaItemDatabaseService);
  });

  afterEach(async () => {
    if (app) await app.close();
  });

  // 👇 ADDED /media/ prefix to ALL items URLs 👇
  describe("GET /media/items", () => {
    it("should return 200 with a paginated list of flattened items", () => {
      return request(app.getHttpServer())
        .get("/media/items?lang=en")
        .expect(200)
        .expect(paginatedResponse([mockMediaItemView]));
    });
  });

  describe("GET /media/items/:itemId", () => {
    it("should return 200 with the correct flattened item", () => {
      return request(app.getHttpServer())
        .get("/media/items/1?lang=en")
        .expect(200)
        .expect(mockMediaItemView);
    });
  });

  describe("POST /media/items", () => {
    it("should return 201 with the created item", () => {
      return request(app.getHttpServer())
        .post("/media/items")
        .send({
          type: "image",
          original_filename: "test.png",
          position: "main",
          width: 1920,
          height: 1080,
          title: { en: "Test Media", nl: "Test Media" },
          description: { en: "Desc", nl: "Beschrijving" },
          credits: { en: "Credits", nl: "Credits" },
        })
        .expect(201)
        .expect(mockMediaItem);
    });
  });

  describe("PUT /media/items/:itemId", () => {
    it("should return 200 with the replaced item", () => {
      return request(app.getHttpServer())
        .put("/media/items/1")
        .send({
          type: "image",
          original_filename: "test.png",
          position: "main",
          width: 1920,
          height: 1080,
          title: { en: "Test Media", nl: "Test Media" },
          description: { en: "Desc", nl: "Beschrijving" },
          credits: { en: "Credits", nl: "Credits" },
        })
        .expect(200)
        .expect(mockMediaItem);
    });
  });

  describe("PATCH /media/items/:itemId", () => {
    it("should return 200 with the modified item", () => {
      return request(app.getHttpServer())
        .patch("/media/items/1")
        .send({ position: "carousel" })
        .expect(200)
        .expect(mockMediaItem);
    });
  });

  describe("DELETE /media/items/:itemId", () => {
    it("should return 200 after deleting item", () => {
      return request(app.getHttpServer()).delete("/media/items/1").expect(200);
    });
  });

  // Relationships: Item <-> Crops
  describe("GET /media/items/:itemId/crops", () => {
    it("should return 200 with the crops of the item", () => {
      return request(app.getHttpServer())
        .get("/media/items/1/crops")
        .expect(200)
        .expect([mockMediaCrop]);
    });
  });

  describe("PUT /media/items/:itemId/crops/:cropId", () => {
    it("should return 200 after successfully linking crop", () => {
      return request(app.getHttpServer())
        .put("/media/items/1/crops/2")
        .expect(200);
    });
  });

  describe("DELETE /media/items/:itemId/crops/:cropId", () => {
    it("should return 200 after unlinking crop", () => {
      return request(app.getHttpServer())
        .delete("/media/items/1/crops/2")
        .expect(200);
    });
  });
});

// ==========================================
// MEDIA GALLERY endpoints
// ==========================================

describe("MediaGalleryController (e2e)", () => {
  let app: INestApplication;
  let mediaDb: MediaGalleryDatabaseService;

  beforeEach(async () => {
    app = await buildApp();
    mediaDb = app.get<MediaGalleryDatabaseService>(MediaGalleryDatabaseService);
  });

  afterEach(async () => {
    if (app) await app.close();
  });

  // 👇 ADDED /media/ prefix to ALL galleries URLs 👇
  describe("GET /media/galleries", () => {
    it("should return 200 with a paginated list of galleries", () => {
      return request(app.getHttpServer())
        .get("/media/galleries?page=1&limit=10")
        .expect(200)
        .expect(paginatedResponse([mockMediaGallery]));
    });
  });

  describe("GET /media/galleries/:galleryId", () => {
    it("should return 200 with the correct gallery", () => {
      return request(app.getHttpServer())
        .get("/media/galleries/1")
        .expect(200)
        .expect(mockMediaGallery);
    });
  });

  describe("POST /media/galleries", () => {
    it("should return 201 with the created gallery", () => {
      return request(app.getHttpServer())
        .post("/media/galleries")
        .send({ name: "hi", type: "default" })
        .expect(201)
        .expect(mockMediaGallery);
    });
  });

  describe("PUT /media/galleries/:galleryId", () => {
    it("should return 200 with the replaced gallery", () => {
      return request(app.getHttpServer())
        .put("/media/galleries/1")
        .send({ name: "completely replaced gallery", type: "default" })
        .expect(200)
        .expect(mockMediaGallery);
    });
  });

  describe("PATCH /media/galleries/:galleryId", () => {
    it("should return 200 with the modified gallery", () => {
      return request(app.getHttpServer())
        .patch("/media/galleries/1")
        .send({ name: "just updated the name" })
        .expect(200)
        .expect(mockMediaGallery);
    });
  });

  describe("DELETE /media/galleries/:galleryId", () => {
    it("should return 200 after deleting gallery", () => {
      return request(app.getHttpServer())
        .delete("/media/galleries/1")
        .expect(200);
    });
  });

  // Relationships: Gallery <-> Items
  describe("GET /media/galleries/:galleryId/items", () => {
    it("should return 200 with items of the gallery", () => {
      return request(app.getHttpServer())
        .get("/media/galleries/1/items")
        .expect(200)
        .expect([mockMediaItem]);
    });
  });

  describe("PUT /media/galleries/:galleryId/items/:itemId", () => {
    it("should return 200 after linking item to gallery", () => {
      return request(app.getHttpServer())
        .put("/media/galleries/1/items/2")
        .expect(200);
    });
  });

  describe("DELETE /media/galleries/:galleryId/items/:itemId", () => {
    it("should return 200 after unlinking item from gallery", () => {
      return request(app.getHttpServer())
        .delete("/media/galleries/1/items/2")
        .expect(200);
    });
  });
});
