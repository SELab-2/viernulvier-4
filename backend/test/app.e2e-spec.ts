import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { BlogModule } from "../src/blog/blog.module";
import { EventModule } from "../src/event/event.module";
import { ProductionModule } from "../src/production/production.module";
import { TagModule } from "../src/tag/tag.module";
import { BlogDatabaseService } from "../src/database/db.blog.service";
import { EventDatabaseService } from "../src/database/db.event.service";
import { ProductionDatabaseService } from "../src/database/db.production.service";
import { TagDatabaseService } from "../src/database/db.tag.service";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const mockBlog = {
  id: 1,
  titel: "Test Blog",
  description: "Test blog description",
};

const mockBlog2 = {
  id: 2,
  titel: "Second Blog",
  description: "Second blog description",
};

const mockTag = {
  id: 1,
  tag: "Drama",
};

const mockTag2 = {
  id: 2,
  tag: "Comedy",
};

const mockProduction = {
  id: 1,
  titel: "Test Production",
  ondertitel: "A subtitle",
  description1: "First description",
  description2: "Second description",
  genre: "Drama",
  planning_id: 1,
};

const mockEvent = {
  id: 1,
  starttime: "2025-01-01T19:00:00.000Z",
  endtime: "2025-01-01T22:00:00.000Z",
  price: 15.5,
  hall: "Hall A",
  production_id: 1,
};

// ---------------------------------------------------------------------------
// Mock DB service factories
// ---------------------------------------------------------------------------

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
});

const mockProductionDbService = () => ({
  getProductions: jest.fn().mockResolvedValue([mockProduction]),
  getProductionById: jest.fn().mockResolvedValue(mockProduction),
  createProduction: jest.fn().mockResolvedValue(mockProduction),
  updateProduction: jest.fn().mockResolvedValue(mockProduction),
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

// ---------------------------------------------------------------------------
// Helper: build app with all modules
// ---------------------------------------------------------------------------

async function buildApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [BlogModule, EventModule, ProductionModule, TagModule],
  })
    .overrideProvider(BlogDatabaseService)
    .useFactory({ factory: mockBlogDbService })
    .overrideProvider(EventDatabaseService)
    .useFactory({ factory: mockEventDbService })
    .overrideProvider(ProductionDatabaseService)
    .useFactory({ factory: mockProductionDbService })
    .overrideProvider(TagDatabaseService)
    .useFactory({ factory: mockTagDbService })
    .compile();

  const app = moduleFixture.createNestApplication();
  await app.init();
  return app;
}

// ===========================================================================
// BLOG endpoints
// ===========================================================================

describe("BlogController (e2e)", () => {
  let app: INestApplication;
  let blogDb: BlogDatabaseService;

  beforeEach(async () => {
    app = await buildApp();
    blogDb = app.get<BlogDatabaseService>(BlogDatabaseService);
  });

  afterEach(async () => {
    await app.close();
  });

  // GET /blog
  describe("GET /blog", () => {
    it("should return 200 with an array of blogs", () => {
      return request(app.getHttpServer())
        .get("/blog")
        .expect(200)
        .expect([mockBlog, mockBlog2]);
    });

    it("should call blogDb.getBlogs()", async () => {
      await request(app.getHttpServer()).get("/blog");
      expect(blogDb.getBlogs).toHaveBeenCalled();
    });

    it("should return 200 with an empty array when no blogs exist", async () => {
      jest.spyOn(blogDb, "getBlogs").mockResolvedValueOnce([]);
      return request(app.getHttpServer()).get("/blog").expect(200).expect([]);
    });
  });

  // GET /blog/:id
  describe("GET /blog/:id", () => {
    it("should return 200 with the correct blog", () => {
      return request(app.getHttpServer())
        .get("/blog/1")
        .expect(200)
        .expect(mockBlog);
    });

    it("should call blogDb.getBlogById with the correct id", async () => {
      await request(app.getHttpServer()).get("/blog/1");
      expect(blogDb.getBlogById).toHaveBeenCalledWith(1);
    });

    it("should return 400 when id is not a number", () => {
      return request(app.getHttpServer()).get("/blog/abc").expect(400);
    });

    it("should propagate errors from the database", async () => {
      jest
        .spyOn(blogDb, "getBlogById")
        .mockRejectedValueOnce(new Error("Not Found"));
      return request(app.getHttpServer()).get("/blog/999").expect(500);
    });
  });

  // POST /blog
  describe("POST /blog", () => {
    const createPayload = { titel: "New Blog", description: "New description" };

    it("should return 201 with the created blog", () => {
      return request(app.getHttpServer())
        .post("/blog")
        .send(createPayload)
        .expect(201)
        .expect(mockBlog);
    });

    it("should call blogDb.createBlog with the payload", async () => {
      await request(app.getHttpServer()).post("/blog").send(createPayload);
      expect(blogDb.createBlog).toHaveBeenCalledWith(createPayload);
    });

    it("should return 400 when body is missing required fields", () => {
      return request(app.getHttpServer())
        .post("/blog")
        .send({ titel: "Only title" })
        .expect(400);
    });
  });

  // PUT /blog/:id
  describe("PUT /blog/:id", () => {
    it("should return 200 with the replaced blog when ids match", () => {
      return request(app.getHttpServer())
        .put("/blog/1")
        .send(mockBlog)
        .expect(200)
        .expect(mockBlog);
    });

    it("should return 400 when URL id and body id do not match", () => {
      return request(app.getHttpServer())
        .put("/blog/2")
        .send(mockBlog) // id: 1 in body
        .expect(400);
    });

    it("should return 400 when id param is not a number", () => {
      return request(app.getHttpServer())
        .put("/blog/abc")
        .send(mockBlog)
        .expect(400);
    });
  });

  // PATCH /blog/:id
  describe("PATCH /blog/:id", () => {
    it("should return 200 with the modified blog", () => {
      return request(app.getHttpServer())
        .patch("/blog/1")
        .send({ titel: "Updated title" })
        .expect(200)
        .expect(mockBlog);
    });

    it("should call blogDb.updateBlog", async () => {
      await request(app.getHttpServer())
        .patch("/blog/1")
        .send({ titel: "Updated title" });
      expect(blogDb.updateBlog).toHaveBeenCalled();
    });

    it("should return 400 when id is not a number", () => {
      return request(app.getHttpServer())
        .patch("/blog/abc")
        .send({ titel: "Updated title" })
        .expect(400);
    });
  });

  // DELETE /blog/:id
  describe("DELETE /blog/:id", () => {
    it("should return 200 when blog is deleted", () => {
      return request(app.getHttpServer()).delete("/blog/1").expect(200);
    });

    it("should call blogDb.deleteBlog with the correct id", async () => {
      await request(app.getHttpServer()).delete("/blog/1");
      expect(blogDb.deleteBlog).toHaveBeenCalledWith(1);
    });

    it("should return 400 when id is not a number", () => {
      return request(app.getHttpServer()).delete("/blog/abc").expect(400);
    });
  });
});

// ===========================================================================
// TAG endpoints
// ===========================================================================

describe("TagController (e2e)", () => {
  let app: INestApplication;
  let tagDb: TagDatabaseService;

  beforeEach(async () => {
    app = await buildApp();
    tagDb = app.get<TagDatabaseService>(TagDatabaseService);
  });

  afterEach(async () => {
    await app.close();
  });

  // GET /tag
  describe("GET /tag", () => {
    it("should return 200 with an array of tags", () => {
      return request(app.getHttpServer())
        .get("/tag")
        .expect(200)
        .expect([mockTag, mockTag2]);
    });

    it("should return 200 with empty array when no tags exist", async () => {
      jest.spyOn(tagDb, "getTags").mockResolvedValueOnce([]);
      return request(app.getHttpServer()).get("/tag").expect(200).expect([]);
    });
  });

  // GET /tag/:id
  describe("GET /tag/:id", () => {
    it("should return 200 with the correct tag", () => {
      return request(app.getHttpServer())
        .get("/tag/1")
        .expect(200)
        .expect(mockTag);
    });

    it("should call tagDb.getTagById with the correct id", async () => {
      await request(app.getHttpServer()).get("/tag/1");
      expect(tagDb.getTagById).toHaveBeenCalledWith(1);
    });

    it("should return 400 when id is not a number", () => {
      return request(app.getHttpServer()).get("/tag/abc").expect(400);
    });
  });

  // POST /tag
  describe("POST /tag", () => {
    const createPayload = { tag: "Thriller" };

    it("should return 201 with the created tag", () => {
      return request(app.getHttpServer())
        .post("/tag")
        .send(createPayload)
        .expect(201)
        .expect(mockTag);
    });

    it("should call tagDb.createTag with the payload", async () => {
      await request(app.getHttpServer()).post("/tag").send(createPayload);
      expect(tagDb.createTag).toHaveBeenCalledWith(createPayload);
    });

    it("should return 400 when body is missing required field 'tag'", () => {
      return request(app.getHttpServer()).post("/tag").send({}).expect(400);
    });
  });

  // PATCH /tag/:id
  describe("PATCH /tag/:id", () => {
    it("should return 200 with the updated tag", () => {
      return request(app.getHttpServer())
        .patch("/tag/1")
        .send({ tag: "Thriller" })
        .expect(200)
        .expect(mockTag);
    });

    it("should return 400 when body id does not match URL id", () => {
      return request(app.getHttpServer())
        .patch("/tag/1")
        .send({ id: 99, tag: "Other" })
        .expect(400);
    });

    it("should return 400 when id is not a number", () => {
      return request(app.getHttpServer())
        .patch("/tag/abc")
        .send({ tag: "Something" })
        .expect(400);
    });
  });

  // DELETE /tag/:id
  describe("DELETE /tag/:id", () => {
    it("should return 200 with a success message", async () => {
      const response = await request(app.getHttpServer())
        .delete("/tag/1")
        .expect(200);
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toContain("1");
    });

    it("should call tagDb.deleteTag with the correct id", async () => {
      await request(app.getHttpServer()).delete("/tag/1");
      expect(tagDb.deleteTag).toHaveBeenCalledWith(1);
    });

    it("should return 400 when id is not a number", () => {
      return request(app.getHttpServer()).delete("/tag/abc").expect(400);
    });
  });
});

// ===========================================================================
// PRODUCTION endpoints
// ===========================================================================

describe("ProductionController (e2e)", () => {
  let app: INestApplication;
  let productionDb: ProductionDatabaseService;

  beforeEach(async () => {
    app = await buildApp();
    productionDb = app.get<ProductionDatabaseService>(ProductionDatabaseService);
  });

  afterEach(async () => {
    await app.close();
  });

  // GET /production
  describe("GET /production", () => {
    it("should return 200 with an array of productions", () => {
      return request(app.getHttpServer())
        .get("/production")
        .expect(200)
        .expect([mockProduction]);
    });

    it("should return 200 with empty array when no productions exist", async () => {
      jest.spyOn(productionDb, "getProductions").mockResolvedValueOnce([]);
      return request(app.getHttpServer())
        .get("/production")
        .expect(200)
        .expect([]);
    });
  });

  // GET /production/:productionId
  describe("GET /production/:productionId", () => {
    it("should return 200 with the correct production", () => {
      return request(app.getHttpServer())
        .get("/production/1")
        .expect(200)
        .expect(mockProduction);
    });

    it("should call productionDb.getProductionById with the correct id", async () => {
      await request(app.getHttpServer()).get("/production/1");
      expect(productionDb.getProductionById).toHaveBeenCalledWith(1);
    });

    it("should return 400 when id is not a number", () => {
      return request(app.getHttpServer()).get("/production/abc").expect(400);
    });
  });

  // POST /production
  describe("POST /production", () => {
    const createPayload = {
      titel: "New Production",
      ondertitel: "Subtitle",
      description1: "Desc 1",
      description2: "Desc 2",
      genre: "Drama",
      planning_id: 2,
    };

    it("should return 201 with the created production", () => {
      return request(app.getHttpServer())
        .post("/production")
        .send(createPayload)
        .expect(201)
        .expect(mockProduction);
    });

    it("should call productionDb.createProduction with the payload", async () => {
      await request(app.getHttpServer()).post("/production").send(createPayload);
      expect(productionDb.createProduction).toHaveBeenCalledWith(createPayload);
    });

    it("should return 400 when required fields are missing", () => {
      return request(app.getHttpServer())
        .post("/production")
        .send({ titel: "Incomplete" })
        .expect(400);
    });
  });

  // PUT /production/:productionId
  describe("PUT /production/:productionId", () => {
    it("should return 200 with the replaced production when ids match", () => {
      return request(app.getHttpServer())
        .put("/production/1")
        .send(mockProduction)
        .expect(200)
        .expect(mockProduction);
    });

    it("should return 400 when URL id and body id do not match", () => {
      return request(app.getHttpServer())
        .put("/production/2")
        .send(mockProduction) // id: 1 in body
        .expect(400);
    });

    it("should return 400 when id is not a number", () => {
      return request(app.getHttpServer())
        .put("/production/abc")
        .send(mockProduction)
        .expect(400);
    });
  });

  // PATCH /production/:productionId
  describe("PATCH /production/:productionId", () => {
    it("should return 200 with the modified production", () => {
      return request(app.getHttpServer())
        .patch("/production/1")
        .send({ titel: "Patched titel" })
        .expect(200)
        .expect(mockProduction);
    });

    it("should call productionDb.updateProduction", async () => {
      await request(app.getHttpServer())
        .patch("/production/1")
        .send({ titel: "Patched titel" });
      expect(productionDb.updateProduction).toHaveBeenCalled();
    });

    it("should return 400 when id is not a number", () => {
      return request(app.getHttpServer())
        .patch("/production/abc")
        .send({ titel: "Patched" })
        .expect(400);
    });
  });

  // DELETE /production/:productionId
  describe("DELETE /production/:productionId", () => {
    it("should return 200 when production is deleted", () => {
      return request(app.getHttpServer()).delete("/production/1").expect(200);
    });

    it("should call productionDb.deleteProduction with the correct id", async () => {
      await request(app.getHttpServer()).delete("/production/1");
      expect(productionDb.deleteProduction).toHaveBeenCalledWith(1);
    });

    it("should return 400 when id is not a number", () => {
      return request(app.getHttpServer()).delete("/production/abc").expect(400);
    });
  });
});

// ===========================================================================
// PRODUCTION - BLOG relationship endpoints
// ===========================================================================

describe("ProductionBlogController (e2e)", () => {
  let app: INestApplication;
  let productionDb: ProductionDatabaseService;
  let blogDb: BlogDatabaseService;

  beforeEach(async () => {
    app = await buildApp();
    productionDb = app.get<ProductionDatabaseService>(ProductionDatabaseService);
    blogDb = app.get<BlogDatabaseService>(BlogDatabaseService);
  });

  afterEach(async () => {
    await app.close();
  });

  // GET /production/:productionId/blog
  describe("GET /production/:productionId/blog", () => {
    it("should return 200 with blogs linked to the production", () => {
      return request(app.getHttpServer())
        .get("/production/1/blog")
        .expect(200)
        .expect([mockBlog]);
    });

    it("should call productionDb.getBlogsOfProduction with the correct id", async () => {
      await request(app.getHttpServer()).get("/production/1/blog");
      expect(productionDb.getBlogsOfProduction).toHaveBeenCalledWith(1);
    });

    it("should return 400 when productionId is not a number", () => {
      return request(app.getHttpServer())
        .get("/production/abc/blog")
        .expect(400);
    });
  });

  // PUT /production/:productionId/blog/:blogId
  describe("PUT /production/:productionId/blog/:blogId", () => {
    it("should return 200 with the linked blog", () => {
      return request(app.getHttpServer())
        .put("/production/1/blog/1")
        .expect(200)
        .expect(mockBlog);
    });

    it("should call productionDb.linkBlogWithProductionID with correct ids", async () => {
      await request(app.getHttpServer()).put("/production/1/blog/2");
      expect(productionDb.linkBlogWithProductionID).toHaveBeenCalledWith(2, 1);
    });

    it("should return 400 when productionId is not a number", () => {
      return request(app.getHttpServer())
        .put("/production/abc/blog/1")
        .expect(400);
    });

    it("should return 400 when blogId is not a number", () => {
      return request(app.getHttpServer())
        .put("/production/1/blog/abc")
        .expect(400);
    });
  });

  // DELETE /production/:productionId/blog/:blogId
  describe("DELETE /production/:productionId/blog/:blogId", () => {
    it("should return 200 with the production after unlinking", () => {
      return request(app.getHttpServer())
        .delete("/production/1/blog/1")
        .expect(200)
        .expect(mockProduction);
    });

    it("should call productionDb.deleteBlogFromProduction with correct ids", async () => {
      await request(app.getHttpServer()).delete("/production/1/blog/2");
      expect(productionDb.deleteBlogFromProduction).toHaveBeenCalledWith(1, 2);
    });

    it("should return 400 when productionId is not a number", () => {
      return request(app.getHttpServer())
        .delete("/production/abc/blog/1")
        .expect(400);
    });
  });
});

// ===========================================================================
// PRODUCTION - TAG relationship endpoints
// ===========================================================================

describe("ProductionTagController (e2e)", () => {
  let app: INestApplication;
  let productionDb: ProductionDatabaseService;

  beforeEach(async () => {
    app = await buildApp();
    productionDb = app.get<ProductionDatabaseService>(ProductionDatabaseService);
  });

  afterEach(async () => {
    await app.close();
  });

  // GET /production/:productionId/tag
  describe("GET /production/:productionId/tag", () => {
    it("should return 200 with tags linked to the production", () => {
      return request(app.getHttpServer())
        .get("/production/1/tag")
        .expect(200)
        .expect([mockTag]);
    });

    it("should call productionDb.getTagsOfProduction", async () => {
      await request(app.getHttpServer()).get("/production/1/tag");
      expect(productionDb.getTagsOfProduction).toHaveBeenCalled();
    });

    it("should return 400 when productionId is not a number", () => {
      return request(app.getHttpServer())
        .get("/production/abc/tag")
        .expect(400);
    });
  });

  // PUT /production/:productionId/tag/:tagId
  describe("PUT /production/:productionId/tag/:tagId", () => {
    it("should return 200 with the production after adding tag", () => {
      return request(app.getHttpServer())
        .put("/production/1/tag/1")
        .expect(200)
        .expect(mockProduction);
    });

    it("should call productionDb.addTagToProduction with correct ids", async () => {
      await request(app.getHttpServer()).put("/production/1/tag/2");
      expect(productionDb.addTagToProduction).toHaveBeenCalledWith(2, 1);
    });

    it("should return 400 when productionId is not a number", () => {
      return request(app.getHttpServer())
        .put("/production/abc/tag/1")
        .expect(400);
    });

    it("should return 400 when tagId is not a number", () => {
      return request(app.getHttpServer())
        .put("/production/1/tag/abc")
        .expect(400);
    });
  });

  // DELETE /production/:productionId/tag/:tagId
  describe("DELETE /production/:productionId/tag/:tagId", () => {
    it("should return 200 with the production after removing tag", () => {
      return request(app.getHttpServer())
        .delete("/production/1/tag/1")
        .expect(200)
        .expect(mockProduction);
    });

    it("should call productionDb.removeTagFromProduction with correct ids", async () => {
      await request(app.getHttpServer()).delete("/production/1/tag/2");
      expect(productionDb.removeTagFromProduction).toHaveBeenCalledWith(2, 1);
    });

    it("should return 400 when productionId is not a number", () => {
      return request(app.getHttpServer())
        .delete("/production/abc/tag/1")
        .expect(400);
    });
  });
});

// ===========================================================================
// EVENT endpoints
// ===========================================================================

describe("EventController (e2e)", () => {
  let app: INestApplication;
  let eventDb: EventDatabaseService;

  beforeEach(async () => {
    app = await buildApp();
    eventDb = app.get<EventDatabaseService>(EventDatabaseService);
  });

  afterEach(async () => {
    await app.close();
  });

  // GET /event
  describe("GET /event", () => {
    it("should return 200 with an array of events", () => {
      return request(app.getHttpServer())
        .get("/event")
        .expect(200)
        .expect([mockEvent]);
    });

    it("should return 200 with empty array when no events exist", async () => {
      jest.spyOn(eventDb, "getEvents").mockResolvedValueOnce([]);
      return request(app.getHttpServer()).get("/event").expect(200).expect([]);
    });
  });

  // GET /event/:id
  describe("GET /event/:id", () => {
    it("should return 200 with the correct event", () => {
      return request(app.getHttpServer())
        .get("/event/1")
        .expect(200)
        .expect(mockEvent);
    });

    it("should call eventDb.getEventById with the correct id", async () => {
      await request(app.getHttpServer()).get("/event/1");
      expect(eventDb.getEventById).toHaveBeenCalledWith(1);
    });

    it("should return 400 when id is not a number", () => {
      return request(app.getHttpServer()).get("/event/abc").expect(400);
    });
  });

  // POST /event
  describe("POST /event", () => {
    const createPayload = {
      starttime: "2025-06-01T19:00:00.000Z",
      endtime: "2025-06-01T22:00:00.000Z",
      price: 20.0,
      hall: "Hall B",
      production_id: 1,
    };

    it("should return 201 with the created event", () => {
      return request(app.getHttpServer())
        .post("/event")
        .send(createPayload)
        .expect(201)
        .expect(mockEvent);
    });

    it("should call eventDb.createEvent with the payload", async () => {
      await request(app.getHttpServer()).post("/event").send(createPayload);
      expect(eventDb.createEvent).toHaveBeenCalledWith(createPayload);
    });

    it("should return 400 when required fields are missing", () => {
      return request(app.getHttpServer())
        .post("/event")
        .send({ hall: "Hall B" })
        .expect(400);
    });
  });

  // PUT /event/:id
  describe("PUT /event/:id", () => {
    it("should return 200 with the replaced event when ids match", () => {
      return request(app.getHttpServer())
        .put("/event/1")
        .send(mockEvent)
        .expect(200)
        .expect(mockEvent);
    });

    it("should return 400 when URL id and body id do not match", () => {
      return request(app.getHttpServer())
        .put("/event/2")
        .send(mockEvent) // id: 1 in body
        .expect(400);
    });

    it("should return 400 when id is not a number", () => {
      return request(app.getHttpServer())
        .put("/event/abc")
        .send(mockEvent)
        .expect(400);
    });
  });

  // PATCH /event/:id
  describe("PATCH /event/:id", () => {
    it("should return 200 with the modified event", () => {
      return request(app.getHttpServer())
        .patch("/event/1")
        .send({ hall: "Hall C" })
        .expect(200)
        .expect(mockEvent);
    });

    it("should call eventDb.updateEvent after merging data", async () => {
      await request(app.getHttpServer())
        .patch("/event/1")
        .send({ hall: "Hall C" });
      expect(eventDb.updateEvent).toHaveBeenCalled();
    });

    it("should return 400 when id is not a number", () => {
      return request(app.getHttpServer())
        .patch("/event/abc")
        .send({ hall: "Hall C" })
        .expect(400);
    });
  });

  // DELETE /event/:id
  describe("DELETE /event/:id", () => {
    it("should return 200 when event is deleted", () => {
      return request(app.getHttpServer()).delete("/event/1").expect(200);
    });

    it("should call eventDb.deleteEvent with the correct id", async () => {
      await request(app.getHttpServer()).delete("/event/1");
      expect(eventDb.deleteEvent).toHaveBeenCalledWith(1);
    });

    it("should return 400 when id is not a number", () => {
      return request(app.getHttpServer()).delete("/event/abc").expect(400);
    });
  });

  // GET /event/:id/blog
  describe("GET /event/:id/blog", () => {
    it("should return 200 with blogs linked to the event", () => {
      return request(app.getHttpServer())
        .get("/event/1/blog")
        .expect(200)
        .expect([mockBlog]);
    });

    it("should call eventDb.getBlogsOfEvent with the correct id", async () => {
      await request(app.getHttpServer()).get("/event/1/blog");
      expect(eventDb.getBlogsOfEvent).toHaveBeenCalledWith(1);
    });

    it("should return 400 when id is not a number", () => {
      return request(app.getHttpServer()).get("/event/abc/blog").expect(400);
    });
  });

  // PUT /event/:id/blog/:id2
  describe("PUT /event/:id/blog/:id2", () => {
    it("should return 200 with the linked blog", () => {
      return request(app.getHttpServer())
        .put("/event/1/blog/1")
        .expect(200)
        .expect(mockBlog);
    });

    it("should call eventDb.linkBlogWithEventID with correct ids", async () => {
      await request(app.getHttpServer()).put("/event/1/blog/2");
      expect(eventDb.linkBlogWithEventID).toHaveBeenCalledWith(2, 1);
    });

    it("should return 400 when eventId is not a number", () => {
      return request(app.getHttpServer())
        .put("/event/abc/blog/1")
        .expect(400);
    });

    it("should return 400 when blogId is not a number", () => {
      return request(app.getHttpServer())
        .put("/event/1/blog/abc")
        .expect(400);
    });
  });

  // DELETE /event/:id/blog/:id2
  describe("DELETE /event/:id/blog/:id2", () => {
    it("should return 200 with the event after unlinking", () => {
      return request(app.getHttpServer())
        .delete("/event/1/blog/1")
        .expect(200)
        .expect(mockEvent);
    });

    it("should call eventDb.deleteBlogFromEvent with correct ids", async () => {
      await request(app.getHttpServer()).delete("/event/1/blog/2");
      expect(eventDb.deleteBlogFromEvent).toHaveBeenCalledWith(1, 2);
    });

    it("should return 400 when eventId is not a number", () => {
      return request(app.getHttpServer())
        .delete("/event/abc/blog/1")
        .expect(400);
    });
  });
});