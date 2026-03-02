import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../app.module";

describe("AuthGuards tests", () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe("Event endpoints authentication", () => {
    it("GET /events should work without API key", async () => {
      await request(app.getHttpServer()).get("/event").expect(200);
    });

    it("GET /events/:id should work without API key", async () => {
      await request(app.getHttpServer()).get("/event/1").send({}).expect(200);
    });

    it("POST /events should fail without API key", async () => {
      await request(app.getHttpServer()).post("/event").send({}).expect(401);
    });

    it("PUT /events/:id should fail without API key", async () => {
      await request(app.getHttpServer()).put("/event/1").send({}).expect(401);
    });

    it("DELETE /events/:id should fail without API key", async () => {
      await request(app.getHttpServer()).delete("/event/1").expect(401);
    });
  });

  describe("Production endpoints authentication", () => {
    it("GET /productions should work without API key", async () => {
      await request(app.getHttpServer()).get("/production").expect(200);
    });

    it("GET /productions/:id should work without API key", async () => {
      await request(app.getHttpServer())
        .get("/production/1")
        .send({})
        .expect(200);
    });

    it("POST /productions should fail without API key", async () => {
      await request(app.getHttpServer())
        .post("/production")
        .send({})
        .expect(401);
    });

    it("PUT /productions/:id should fail without API key", async () => {
      await request(app.getHttpServer())
        .put("/production/1")
        .send({})
        .expect(401);
    });

    it("DELETE /productions/:id should fail without API key", async () => {
      await request(app.getHttpServer()).delete("/production/1").expect(401);
    });

    it("PATCH /productions/:id should fail without API key", async () => {
      await request(app.getHttpServer()).patch("/production/1").expect(401);
    });
  });

  describe("Production-blog endpoints authentication", () => {
    it("GET /productions/:id/blogs should work without API key", async () => {
      await request(app.getHttpServer()).get("/production/1/blog").expect(200);
    });

    it("PUT /productions/:id/blogs/:id should fail without API key", async () => {
      await request(app.getHttpServer())
        .put("/production/1/blog/1")
        .send({})
        .expect(401);
    });

    it("DELETE /productions/:id/blogs/:id  should fail without API key", async () => {
      await request(app.getHttpServer())
        .delete("/production/1/blog/1")
        .expect(401);
    });
  });

  describe("Production-tag endpoints authentication", () => {
    it("GET /productions/:id/tags should work without API key", async () => {
      await request(app.getHttpServer()).get("/production/1/tag").expect(200);
    });

    it("PUT /productions/:id/tags/:id should fail without API key", async () => {
      await request(app.getHttpServer())
        .put("/production/1/tag/1")
        .send({})
        .expect(401);
    });

    it("DELETE /productions/:id/tags/:id  should fail without API key", async () => {
      await request(app.getHttpServer())
        .delete("/production/1/tag/1")
        .expect(401);
    });
  });

  describe("Tag endpoints authentication", () => {
    it("GET /tags should work without API key", async () => {
      await request(app.getHttpServer()).get("/tag").expect(200);
    });

    it("POST /tags should fail without API key", async () => {
      await request(app.getHttpServer()).post("/tag").send({}).expect(401);
    });

    it("GET /tags/:id should work without API key", async () => {
      await request(app.getHttpServer()).get("/tag/1").send({}).expect(200);
    });

    it("DELETE /tags/:id should fail without API key", async () => {
      await request(app.getHttpServer()).delete("/tag/1").expect(401);
    });

    it("PATCH /tags/:id should fail without API key", async () => {
      await request(app.getHttpServer()).patch("/tag/1").expect(401);
    });
  });

  describe("Blog endpoints authentication", () => {
    it("GET /blogs should work without API key", async () => {
      await request(app.getHttpServer()).get("/blog").expect(200);
    });

    it("POST /blogs should fail without API key", async () => {
      await request(app.getHttpServer()).post("/blog").send({}).expect(401);
    });

    it("GET /blogs/:id should work without API key", async () => {
      await request(app.getHttpServer()).get("/blog/1").send({}).expect(200);
    });

    it("DELETE /blogs/:id should fail without API key", async () => {
      await request(app.getHttpServer()).delete("/blog/1").expect(401);
    });

    it("PATCH /blogs/:id should fail without API key", async () => {
      await request(app.getHttpServer()).patch("/blog/1").expect(401);
    });

    it("PUT /blogs/:id should fail without API key", async () => {
      await request(app.getHttpServer()).put("/blog/1").expect(401);
    });
  });
});
