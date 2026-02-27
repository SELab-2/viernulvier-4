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

import request from "supertest";

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

// Mock DB service factories

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

// Helper: build app with all modules

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
