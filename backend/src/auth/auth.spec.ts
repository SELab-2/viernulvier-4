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
      await request(app.getHttpServer()).get("/events").expect(200);
    });

    it("GET /events/:id should work without API key", async () => {
      await request(app.getHttpServer()).get("/events/1").send({}).expect(200);
    });

    it("POST /events should fail without API key", async () => {
      await request(app.getHttpServer()).post("/events").send({}).expect(401);
    });

    it("PUT /events/:id should fail without API key", async () => {
      await request(app.getHttpServer()).put("/events/1").send({}).expect(401);
    });

    it("DELETE /events/:id should fail without API key", async () => {
      await request(app.getHttpServer()).delete("/events/1").expect(401);
    });

    it("GET /events/:eventId/locations", async () => {
      await request(app.getHttpServer()).get("/events/1/locations").expect(200);
    });
  });

  describe("Event - Location endpoints authentication", () => {
    it("GET /events/:eventId/locations should work without API key", async () => {
      await request(app.getHttpServer()).get("/events/1/locations").expect(200);
    });

    it("PUT /events/:eventId/locations/:locationId should fail without API key.", async () => {
      await request(app.getHttpServer())
        .put("/events/1/locations/1")
        .expect(401);
    });

    it("DELETE /events/:eventId/locations should fail without API key.", async () => {
      await request(app.getHttpServer())
        .delete("/events/1/locations")
        .expect(401);
    });
  });

  describe("Production endpoints authentication", () => {
    it("GET /productions should work without API key", async () => {
      await request(app.getHttpServer()).get("/productions").expect(200);
    });

    it("GET /productions/:id should work without API key", async () => {
      await request(app.getHttpServer())
        .get("/productions/1")
        .send({})
        .expect(200);
    });

    it("POST /productions should fail without API key", async () => {
      await request(app.getHttpServer())
        .post("/productions")
        .send({})
        .expect(401);
    });

    it("PUT /productions/:id should fail without API key", async () => {
      await request(app.getHttpServer())
        .put("/productions/1")
        .send({})
        .expect(401);
    });

    it("DELETE /productions/:id should fail without API key", async () => {
      await request(app.getHttpServer()).delete("/productions/1").expect(401);
    });

    it("PATCH /productions/:id should fail without API key", async () => {
      await request(app.getHttpServer()).patch("/productions/1").expect(401);
    });
  });

  describe("Production-blog endpoints authentication", () => {
    it("GET /productions/:id/blogs should work without API key", async () => {
      await request(app.getHttpServer())
        .get("/productions/1/blogs")
        .expect(200);
    });

    it("PUT /productions/:id/blogs/:id should fail without API key", async () => {
      await request(app.getHttpServer())
        .put("/productions/1/blogs/1")
        .send({})
        .expect(401);
    });

    it("DELETE /productions/:id/blogs/:id  should fail without API key", async () => {
      await request(app.getHttpServer())
        .delete("/productions/1/blogs/1")
        .expect(401);
    });
  });

  describe("Production-tag endpoints authentication", () => {
    it("GET /productions/:id/tags should work without API key", async () => {
      await request(app.getHttpServer()).get("/productions/1/tags").expect(200);
    });

    it("PUT /productions/:id/tags/:id should fail without API key", async () => {
      await request(app.getHttpServer())
        .put("/productions/1/tags/1")
        .send({})
        .expect(401);
    });

    it("DELETE /productions/:id/tags/:id  should fail without API key", async () => {
      await request(app.getHttpServer())
        .delete("/productions/1/tags/1")
        .expect(401);
    });
  });

  describe("Tag endpoints authentication", () => {
    it("GET /tags should work without API key", async () => {
      await request(app.getHttpServer()).get("/tags").expect(200);
    });

    it("POST /tags should fail without API key", async () => {
      await request(app.getHttpServer()).post("/tags").send({}).expect(401);
    });

    it("GET /tags/:id should work without API key", async () => {
      await request(app.getHttpServer()).get("/tags/1").send({}).expect(200);
    });

    it("DELETE /tags/:id should fail without API key", async () => {
      await request(app.getHttpServer()).delete("/tags/1").expect(401);
    });

    it("PATCH /tags/:id should fail without API key", async () => {
      await request(app.getHttpServer()).patch("/tags/1").expect(401);
    });
  });

  describe("Blog endpoints authentication", () => {
    it("GET /blogs should work without API key", async () => {
      await request(app.getHttpServer()).get("/blogs").expect(200);
    });

    it("POST /blogs should fail without API key", async () => {
      await request(app.getHttpServer()).post("/blogs").send({}).expect(401);
    });

    it("GET /blogs/:id should work without API key", async () => {
      await request(app.getHttpServer()).get("/blogs/1").send({}).expect(200);
    });

    it("DELETE /blogs/:id should fail without API key", async () => {
      await request(app.getHttpServer()).delete("/blogs/1").expect(401);
    });

    it("PATCH /blogs/:id should fail without API key", async () => {
      await request(app.getHttpServer()).patch("/blogs/1").expect(401);
    });

    it("PUT /blogs/:id should fail without API key", async () => {
      await request(app.getHttpServer()).put("/blogs/1").expect(401);
    });
  });

  describe("Location endpoints authentication", () => {
    it("GET /locations should work without API key", async () => {
      await request(app.getHttpServer()).get("/locations").expect(200);
    });

    it("GET /locations/:locationId should work without API key", async () => {
      await request(app.getHttpServer()).get("/locations/1").expect(200);
    });

    it("POST /locations should fail without API key", async () => {
      await request(app.getHttpServer()).post("/locations").expect(401);
    });

    it("PATCH /locations should fail without API key", async () => {
      await request(app.getHttpServer()).patch("/locations").expect(401);
    });

    it("DELETE /locations/:locationId should fail without API key", async () => {
      await request(app.getHttpServer()).delete("/locations/1").expect(401);
    });
  });

  describe("Auth endpoints authentication", () => {
    it("POST /auth/login should pass without API Key.", async () => {
      // * Note: This will return badrequest because we are passing no body.
      await request(app.getHttpServer()).post("/auth/login").expect(400);
    });

    it("GET /auth should fail without API key.", async () => {
      await request(app.getHttpServer()).get("/auth").expect(401);
    });

    it("POST /auth should fail without API key.", async () => {
      await request(app.getHttpServer()).post("/auth").expect(401);
    });

    it("PATCH /auth should fail without API key.", async () => {
      await request(app.getHttpServer()).patch("/auth").expect(401);
    });

    it("DELETE /auth/:accountId should fail without API key.", async () => {
      await request(app.getHttpServer()).delete("/auth/1").expect(401);
    });
  });
});
