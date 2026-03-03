import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { BlogModule } from "../src/blog/blog.module";
import { EventModule } from "../src/event/event.module";
import { ProductionModule } from "../src/production/production.module";
import { TagModule } from "../src/tag/tag.module";
import { BlogDatabaseService } from "../src/database/db.blog.service";
import { EventDatabaseService } from "../src/database/db.event.service";
import { ProductionDatabaseService } from "../src/database/db.production.service";
import { TagDatabaseService } from "../src/database/db.tag.service";
import { LocationModule } from "../src/location/location.module";
import { LocationDatabaseService } from "../src/database/db.location.service";

import request from "supertest";
import { ApiKeyGuard } from "../src/auth/authGuard";

// Mock data

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
  planning_id: "1",
};

const mockEvent = {
  id: 1,
  starttime: "2025-01-01T19:00:00.000Z",
  endtime: "2025-01-01T22:00:00.000Z",
  price: 15.5,
  production_id: 1,
};

const mockLocation = {
  id: 1,
  location: "Main Stage",
};

// Mock DB service factories

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

// Helper: build app with all modules

async function buildApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    // Add LocationModule here:
    imports: [
      BlogModule,
      EventModule,
      ProductionModule,
      TagModule,
      LocationModule,
    ],
  })
    .overrideGuard(ApiKeyGuard)
    .useValue({ canActivate: jest.fn(() => true) })
    .overrideProvider(BlogDatabaseService)
    .useFactory({ factory: mockBlogDbService })
    .overrideProvider(EventDatabaseService)
    .useFactory({ factory: mockEventDbService })
    .overrideProvider(ProductionDatabaseService)
    .useFactory({ factory: mockProductionDbService })
    .overrideProvider(TagDatabaseService)
    .useFactory({ factory: mockTagDbService })
    // Add this override:
    .overrideProvider(LocationDatabaseService)
    .useFactory({ factory: mockLocationDbService })
    .compile();

  const app = moduleFixture.createNestApplication();
  app.useLogger(false);
  await app.init();
  return app;
}

// BLOG endpoints

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

  // GET /blogs
  describe("GET /blogs", () => {
    it("should return 200 with an array of blogs", () => {
      return request(app.getHttpServer())
        .get("/blogs")
        .expect(200)
        .expect([mockBlog, mockBlog2]);
    });

    it("should call blogDb.getBlogs()", async () => {
      await request(app.getHttpServer()).get("/blogs");
      expect(blogDb.getBlogs).toHaveBeenCalled();
    });

    it("should return 200 with an empty array when no blogs exist", async () => {
      jest.spyOn(blogDb, "getBlogs").mockResolvedValueOnce([]);
      return request(app.getHttpServer()).get("/blogs").expect(200).expect([]);
    });
  });

  // GET /blogs/:id
  describe("GET /blogs/:id", () => {
    it("should return 200 with the correct blog", () => {
      return request(app.getHttpServer())
        .get("/blogs/1")
        .expect(200)
        .expect(mockBlog);
    });

    it("should call blogDb.getBlogById with the correct id", async () => {
      await request(app.getHttpServer()).get("/blogs/1");
      expect(blogDb.getBlogById).toHaveBeenCalledWith(1);
    });

    it("should return 400 when id is not a number", () => {
      return request(app.getHttpServer()).get("/blogs/abc").expect(400);
    });

    it("should propagate errors from the database", async () => {
      jest
        .spyOn(blogDb, "getBlogById")
        .mockRejectedValueOnce(new Error("Not Found"));
      return request(app.getHttpServer()).get("/blogs/999").expect(500);
    });
  });

  // POST /blogs
  describe("POST /blogs", () => {
    const createPayload = { titel: "New Blog", description: "New description" };

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
        .send({ titel: "Only title" })
        .expect(400);
    });
  });

  // PUT /blogs/:id
  describe("PUT /blogs/:id", () => {
    it("should return 200 with the replaced blog when ids match", () => {
      return request(app.getHttpServer())
        .put("/blogs/1")
        .send(mockBlog)
        .expect(200)
        .expect(mockBlog);
    });

    it("should return 400 when URL id and body id do not match", () => {
      return request(app.getHttpServer())
        .put("/blogs/2")
        .send(mockBlog) // id: 1 in body
        .expect(400);
    });

    it("should return 400 when id param is not a number", () => {
      return request(app.getHttpServer())
        .put("/blogs/abc")
        .send(mockBlog)
        .expect(400);
    });
  });

  // PATCH /blogs/:id
  describe("PATCH /blogs/:id", () => {
    it("should return 200 with the modified blog", () => {
      return request(app.getHttpServer())
        .patch("/blogs/1")
        .send({ titel: "Updated title" })
        .expect(200)
        .expect(mockBlog);
    });

    it("should call blogDb.updateBlog", async () => {
      await request(app.getHttpServer())
        .patch("/blogs/1")
        .send({ titel: "Updated title" });
      expect(blogDb.updateBlog).toHaveBeenCalled();
    });

    it("should return 400 when id is not a number", () => {
      return request(app.getHttpServer())
        .patch("/blogs/abc")
        .send({ titel: "Updated title" })
        .expect(400);
    });
  });

  // DELETE /blogs/:id
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

// TAG endpoints

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

  // GET /tags
  describe("GET /tags", () => {
    it("should return 200 with an array of tags", () => {
      return request(app.getHttpServer())
        .get("/tags")
        .expect(200)
        .expect([mockTag, mockTag2]);
    });

    it("should return 200 with empty array when no tags exist", async () => {
      jest.spyOn(tagDb, "getTags").mockResolvedValueOnce([]);
      return request(app.getHttpServer()).get("/tags").expect(200).expect([]);
    });
  });

  // GET /tags/:id
  describe("GET /tags/:id", () => {
    it("should return 200 with the correct tag", () => {
      return request(app.getHttpServer())
        .get("/tags/1")
        .expect(200)
        .expect(mockTag);
    });

    it("should call tagDb.getTagById with the correct id", async () => {
      await request(app.getHttpServer()).get("/tags/1");
      expect(tagDb.getTagById).toHaveBeenCalledWith(1);
    });

    it("should return 400 when id is not a number", () => {
      return request(app.getHttpServer()).get("/tags/abc").expect(400);
    });
  });

  // POST /tags
  describe("POST /tags", () => {
    const createPayload = { tag: "Thriller" };

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

  // PATCH /tags/:id
  describe("PATCH /tags/:id", () => {
    it("should return 200 with the updated tag", () => {
      return request(app.getHttpServer())
        .patch("/tags/1")
        .send({ tag: "Thriller" })
        .expect(200)
        .expect(mockTag);
    });

    it("should return 400 when body id does not match URL id", () => {
      return request(app.getHttpServer())
        .patch("/tags/1")
        .send({ id: 99, tag: "Other" })
        .expect(400);
    });

    it("should return 400 when id is not a number", () => {
      return request(app.getHttpServer())
        .patch("/tags/abc")
        .send({ tag: "Something" })
        .expect(400);
    });
  });

  // DELETE /tags/:id
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

// PRODUCTION endpoints

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
    await app.close();
  });

  // GET /productions
  describe("GET /productions", () => {
    it("should return 200 with an array of productions", () => {
      return request(app.getHttpServer())
        .get("/productions")
        .expect(200)
        .expect([mockProduction]);
    });

    it("should return 200 with empty array when no productions exist", async () => {
      jest.spyOn(productionDb, "getProductions").mockResolvedValueOnce([]);
      return request(app.getHttpServer())
        .get("/productions")
        .expect(200)
        .expect([]);
    });
  });

  // GET /productions/:productionId
  describe("GET /productions/:productionId", () => {
    it("should return 200 with the correct production", () => {
      return request(app.getHttpServer())
        .get("/productions/1")
        .expect(200)
        .expect(mockProduction);
    });

    it("should call productionDb.getProductionById with the correct id", async () => {
      await request(app.getHttpServer()).get("/productions/1");
      expect(productionDb.getProductionById).toHaveBeenCalledWith(1);
    });

    it("should return 400 when id is not a number", () => {
      return request(app.getHttpServer()).get("/productions/abc").expect(400);
    });
  });

  // POST /productions
  describe("POST /productions", () => {
    const createPayload = {
      titel: "New Production",
      ondertitel: "Subtitle",
      description1: "Desc 1",
      description2: "Desc 2",
      planning_id: "2",
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
        .send({ titel: "Incomplete" })
        .expect(400);
    });
  });

  // PUT /productions/:productionId
  describe("PUT /productions/:productionId", () => {
    it("should return 200 with the replaced production when ids match", () => {
      return request(app.getHttpServer())
        .put("/productions/1")
        .send(mockProduction)
        .expect(200)
        .expect(mockProduction);
    });

    it("should return 400 when URL id and body id do not match", () => {
      return request(app.getHttpServer())
        .put("/productions/2")
        .send(mockProduction) // id: 1 in body
        .expect(400);
    });

    it("should return 400 when id is not a number", () => {
      return request(app.getHttpServer())
        .put("/productions/abc")
        .send(mockProduction)
        .expect(400);
    });
  });

  // PATCH /productions/:productionId
  describe("PATCH /productions/:productionId", () => {
    it("should return 200 with the modified production", () => {
      return request(app.getHttpServer())
        .patch("/productions/1")
        .send({ titel: "Patched titel" })
        .expect(200)
        .expect(mockProduction);
    });

    it("should call productionDb.updateProduction", async () => {
      await request(app.getHttpServer())
        .patch("/productions/1")
        .send({ titel: "Patched titel" });
      expect(productionDb.updateProduction).toHaveBeenCalled();
    });

    it("should return 400 when id is not a number", () => {
      return request(app.getHttpServer())
        .patch("/productions/abc")
        .send({ titel: "Patched" })
        .expect(400);
    });
  });

  // DELETE /productions/:productionId
  describe("DELETE /productions/:productionId", () => {
    it("should return 200 when production is deleted", () => {
      return request(app.getHttpServer()).delete("/productions/1").expect(200);
    });

    it("should call productionDb.deleteProduction with the correct id", async () => {
      await request(app.getHttpServer()).delete("/productions/1");
      expect(productionDb.deleteProduction).toHaveBeenCalledWith(1);
    });

    it("should return 400 when id is not a number", () => {
      return request(app.getHttpServer()).delete("/productions/abc").expect(400);
    });
  });
});

// PRODUCTION - BLOG relationship endpoints

describe("ProductionBlogController (e2e)", () => {
  let app: INestApplication;
  let productionDb: ProductionDatabaseService;
  let blogDb: BlogDatabaseService;

  beforeEach(async () => {
    app = await buildApp();
    productionDb = app.get<ProductionDatabaseService>(
      ProductionDatabaseService,
    );
    blogDb = app.get<BlogDatabaseService>(BlogDatabaseService);
  });

  afterEach(async () => {
    await app.close();
  });

  // GET /productions/:productionId/blogs
  describe("GET /productions/:productionId/blogs", () => {
    it("should return 200 with blogs linked to the production", () => {
      return request(app.getHttpServer())
        .get("/productions/1/blogs")
        .expect(200)
        .expect([mockBlog]);
    });

    it("should call productionDb.getBlogsOfProduction with the correct id", async () => {
      await request(app.getHttpServer()).get("/productions/1/blogs");
      expect(productionDb.getBlogsOfProduction).toHaveBeenCalledWith(1);
    });

    it("should return 400 when productionId is not a number", () => {
      return request(app.getHttpServer())
        .get("/productions/abc/blogs")
        .expect(400);
    });
  });

  // PUT /productions/:productionId/blogs/:blogId
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

  // DELETE /productions/:productionId/blogs/:blogId
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

// PRODUCTION - TAG relationship endpoints

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
    await app.close();
  });

  // GET /productions/:productionId/tags
  describe("GET /productions/:productionId/tags", () => {
    it("should return 200 with tags linked to the production", () => {
      return request(app.getHttpServer())
        .get("/productions/1/tags")
        .expect(200)
        .expect([mockTag]);
    });

    it("should call productionDb.getTagsOfProduction", async () => {
      await request(app.getHttpServer()).get("/productions/1/tags");
      expect(productionDb.getTagsOfProduction).toHaveBeenCalled();
    });

    it("should return 400 when productionId is not a number", () => {
      return request(app.getHttpServer())
        .get("/productions/abc/tags")
        .expect(400);
    });
  });

  // PUT /productions/:productionId/tags/:tagId
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

  // DELETE /productions/:productionId/tags/:tagId
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

// EVENT endpoints

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

  // GET /events
  describe("GET /events", () => {
    it("should return 200 with an array of events", () => {
      return request(app.getHttpServer())
        .get("/events")
        .expect(200)
        .expect([mockEvent]);
    });

    it("should return 200 with empty array when no events exist", async () => {
      jest.spyOn(eventDb, "getEvents").mockResolvedValueOnce([]);
      return request(app.getHttpServer()).get("/events").expect(200).expect([]);
    });
  });

  // GET /events/:id
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

  // POST /events
  describe("POST /events", () => {
    const createPayload = {
      starttime: "2025-06-01T19:00:00.000Z",
      endtime: "2025-06-01T22:00:00.000Z",
      price: 20.0,
      production_id: 1,
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

  // PUT /events/:id
  describe("PUT /events/:id", () => {
    it("should return 200 with the replaced event when ids match", () => {
      return request(app.getHttpServer())
        .put("/events/1")
        .send(mockEvent)
        .expect(200)
        .expect(mockEvent);
    });

    it("should return 400 when URL id and body id do not match", () => {
      return request(app.getHttpServer())
        .put("/events/2")
        .send(mockEvent) // id: 1 in body
        .expect(400);
    });

    it("should return 400 when id is not a number", () => {
      return request(app.getHttpServer())
        .put("/events/abc")
        .send(mockEvent)
        .expect(400);
    });
  });

  // PATCH /events/:id
  describe("PATCH /events/:id", () => {
    it("should return 200 with the modified event", () => {
      return request(app.getHttpServer())
        .patch("/events/1")
        .send({ price: 25.5 })
        .expect(200)
        .expect(mockEvent);
    });

    it("should call eventDb.updateEvent", async () => {
      await request(app.getHttpServer())
        .patch("/events/1")
        .send({ price: 25.5 });
      // Assuming your service calls updateEvent for modifications
      expect(eventDb.updateEvent).toHaveBeenCalled();
    });

    it("should return 400 when id is not a number", () => {
      return request(app.getHttpServer())
        .patch("/events/abc")
        .send({ price: 25.5 })
        .expect(400);
    });
  });

  // DELETE /events/:id
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

  // LOCATION endpoints

  describe("LocationController (e2e)", () => {
    let app: INestApplication;
    let locationDb: LocationDatabaseService;

    beforeEach(async () => {
      app = await buildApp();
      locationDb = app.get<LocationDatabaseService>(LocationDatabaseService);
    });

    afterEach(async () => {
      await app.close();
    });

    // GET /locations
    describe("GET /locations", () => {
      it("should return 200 with an array of locations", () => {
        return request(app.getHttpServer())
          .get("/locations")
          .expect(200)
          .expect([mockLocation]);
      });
    });

    // GET /locations/:locationId
    describe("GET /locations/:locationId", () => {
      it("should return 200 with the correct location", () => {
        return request(app.getHttpServer())
          .get("/locations/1")
          .expect(200)
          .expect(mockLocation);
      });

      it("should return 400 when locationId is not a number", () => {
        return request(app.getHttpServer()).get("/locations/abc").expect(400);
      });
    });

    // POST /locations
    describe("POST /locations", () => {
      it("should return 201 with the created location", () => {
        const createPayload = { location: "Side Stage" };
        return request(app.getHttpServer())
          .post("/locations")
          .send(createPayload)
          .expect(201)
          .expect(mockLocation);
      });
    });

    // PATCH /locations
    // Note: Your controller uses @Patch() without an ID param, expecting it in the DTO
    describe("PATCH /locations", () => {
      it("should return 200 with the updated location", () => {
        const updatePayload = { id: 1, location: "Updated Stage" };
        return request(app.getHttpServer())
          .patch("/locations")
          .send(updatePayload)
          .expect(200)
          .expect(mockLocation);
      });
    });

    // DELETE /locations/:locationId
    describe("DELETE /locations/:locationId", () => {
      it("should return 200 after deleting location", () => {
        return request(app.getHttpServer()).delete("/locations/1").expect(200);
      });

      it("should return 400 when locationId is not a number", () => {
        return request(app.getHttpServer()).delete("/locations/abc").expect(400);
      });
    });
  });

  // EVENT - LOCATION relationship endpoints

  describe("EventLocationController (e2e)", () => {
    let app: INestApplication;
    let eventDb: EventDatabaseService;

    beforeEach(async () => {
      app = await buildApp();
      eventDb = app.get<EventDatabaseService>(EventDatabaseService);
    });

    afterEach(async () => {
      await app.close();
    });

    // GET /events/:eventId/locations
    describe("GET /events/:eventId/locations", () => {
      it("should return 200 with the location of the event", () => {
        return request(app.getHttpServer())
          .get("/events/1/locations")
          .expect(200)
          .expect(mockLocation);
      });

      it("should call eventDb.getLocationOfEvent with the correct id", async () => {
        await request(app.getHttpServer()).get("/events/1/locations");
        expect(eventDb.getLocationOfEvent).toHaveBeenCalledWith(1);
      });

      it("should return 400 when eventId is not a number", () => {
        return request(app.getHttpServer())
          .get("/events/abc/locations")
          .expect(400);
      });
    });

    // PUT /events/:eventId/locations/:locationId
    describe("PUT /events/:eventId/locations/:locationId", () => {
      it("should return 200 after successfully linking", () => {
        return request(app.getHttpServer())
          .put("/events/1/locations/2")
          .expect(200);
      });

      it("should call eventDb.linkEventToLocation with correct ids", async () => {
        await request(app.getHttpServer()).put("/events/1/locations/2");
        expect(eventDb.linkEventToLocation).toHaveBeenCalledWith(1, 2);
      });

      it("should return 400 when eventId is not a number", () => {
        return request(app.getHttpServer())
          .put("/events/abc/locations/1")
          .expect(400);
      });

      it("should return 400 when locationId is not a number", () => {
        return request(app.getHttpServer())
          .put("/events/1/locations/abc")
          .expect(400);
      });
    });

    // DELETE /events/:eventId/locations
    describe("DELETE /events/:eventId/locations", () => {
      it("should return 200 after unlinking", () => {
        return request(app.getHttpServer())
          .delete("/events/1/locations")
          .expect(200);
      });

      it("should call eventDb.deleteLocationFromEvent with the eventId", async () => {
        await request(app.getHttpServer()).delete("/events/1/locations");
        expect(eventDb.deleteLocationFromEvent).toHaveBeenCalledWith(1);
      });

      it("should return 400 when eventId is not a number", () => {
        return request(app.getHttpServer())
          .delete("/events/abc/locations")
          .expect(400);
      });
    });
  });
});
