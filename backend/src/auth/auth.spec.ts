import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../app.module";
import { ScraperService } from "../util/scraper/scraper.service";
import { AppLogger } from "../util/logger/logger.service";
import { MediaStorageService } from "../media/media_storage/media_storage.service";
import { Server } from "http";

// This test is skipped because we closed DB access.
describe.skip("AuthGuards tests", () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AppLogger) // We override these so they don't make a fuss during testing.
      .useValue({
        log: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
        verbose: jest.fn(),
      })
      .overrideProvider(MediaStorageService)
      .useValue({
        save: jest.fn().mockResolvedValue("http://mock-url.com/image.jpg"),
        get: jest.fn().mockResolvedValue(Buffer.from("mock")),
        delete: jest.fn().mockResolvedValue(undefined),
      })
      .overrideProvider(ScraperService)
      .useValue({
        onApplicationBootstrap: jest.fn(),
        handleDailyScrape: jest.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe("Event endpoints authentication", () => {
    it("GET /events should work without API key", async () => {
      await request(app.getHttpServer() as Server)
        .get("/events")
        .expect((res) => {
          expect([200, 404]).toContain(res.status);
        });
    });

    it("GET /events/:id should work without API key", async () => {
      await request(app.getHttpServer() as Server)
        .get("/events/1")
        .send({})
        .expect((res) => {
          expect([200, 404]).toContain(res.status);
        });
    });

    it("POST /events should fail without API key", async () => {
      await request(app.getHttpServer() as Server)
        .post("/events")
        .send({})
        .expect(401);
    });

    it("PUT /events/:id should fail without API key", async () => {
      await request(app.getHttpServer() as Server)
        .put("/events/1")
        .send({})
        .expect(401);
    });

    it("DELETE /events/:id should fail without API key", async () => {
      await request(app.getHttpServer() as Server)
        .delete("/events/1")
        .expect(401);
    });

    it("GET /events/:eventId/location", async () => {
      await request(app.getHttpServer() as Server)
        .get("/events/1/location")
        .expect((res) => {
          expect([200, 404]).toContain(res.status);
        });
    });
  });

  describe("Event - Location endpoints authentication", () => {
    it("GET /events/:eventId/location should work without API key", async () => {
      await request(app.getHttpServer() as Server)
        .get("/events/1/location")
        .expect((res) => {
          expect([200, 404]).toContain(res.status);
        });
    });

    it("PUT /events/:eventId/location/:locationId should fail without API key.", async () => {
      await request(app.getHttpServer() as Server)
        .put("/events/1/location/1")
        .expect(401);
    });

    it("DELETE /events/:eventId/location should fail without API key.", async () => {
      await request(app.getHttpServer() as Server)
        .delete("/events/1/location")
        .expect(401);
    });
  });

  describe("Event - Price endpoints authentication", () => {
    it("GET /events/:eventId/prices should work without API key", async () => {
      await request(app.getHttpServer() as Server)
        .get("/events/1/prices")
        .expect((res) => {
          expect([200, 404]).toContain(res.status);
        });
    });

    it("PUT /events/:eventId/prices/:priceId should fail without API key.", async () => {
      await request(app.getHttpServer() as Server)
        .put("/events/1/prices/2")
        .expect(401);
    });

    it("DELETE /events/:eventId/prices/:priceId should fail without API key.", async () => {
      await request(app.getHttpServer() as Server)
        .delete("/events/1/prices/2")
        .expect(401);
    });
  });

  describe("Production endpoints authentication", () => {
    it("GET /productions should work without API key", async () => {
      await request(app.getHttpServer() as Server)
        .get("/productions")
        .expect((res) => {
          expect([200, 404]).toContain(res.status);
        });
    });

    it("GET /productions/:id should work without API key", async () => {
      await request(app.getHttpServer() as Server)
        .get("/productions/1")
        .send({})
        .expect((res) => {
          expect([200, 404]).toContain(res.status);
        });
    });

    it("POST /productions should fail without API key", async () => {
      await request(app.getHttpServer() as Server)
        .post("/productions")
        .send({})
        .expect(401);
    });

    it("PUT /productions/:id should fail without API key", async () => {
      await request(app.getHttpServer() as Server)
        .put("/productions/1")
        .send({})
        .expect(401);
    });

    it("DELETE /productions/:id should fail without API key", async () => {
      await request(app.getHttpServer() as Server)
        .delete("/productions/1")
        .expect(401);
    });

    it("PATCH /productions/:id should fail without API key", async () => {
      await request(app.getHttpServer() as Server)
        .patch("/productions/1")
        .expect(401);
    });
  });

  describe("Production-blog endpoints authentication", () => {
    it("GET /productions/:id/blogs should work without API key", async () => {
      await request(app.getHttpServer() as Server)
        .get("/productions/1/blogs")
        .expect((res) => {
          expect([200, 404]).toContain(res.status);
        });
    });

    it("PUT /productions/:id/blogs/:id should fail without API key", async () => {
      await request(app.getHttpServer() as Server)
        .put("/productions/1/blogs/1")
        .send({})
        .expect(401);
    });

    it("DELETE /productions/:id/blogs/:id  should fail without API key", async () => {
      await request(app.getHttpServer() as Server)
        .delete("/productions/1/blogs/1")
        .expect(401);
    });
  });

  describe("Production-tag endpoints authentication", () => {
    it("GET /productions/:id/tags should work without API key", async () => {
      const response = await request(app.getHttpServer() as Server).get(
        "/productions/1/tags",
      );
      expect([200, 404]).toContain(response.status);
    });

    it("PUT /productions/:id/tags/:id should fail without API key", async () => {
      await request(app.getHttpServer() as Server)
        .put("/productions/1/tags/1")
        .send({})
        .expect(401);
    });

    it("DELETE /productions/:id/tags/:id  should fail without API key", async () => {
      await request(app.getHttpServer() as Server)
        .delete("/productions/1/tags/1")
        .expect(401);
    });
  });

  describe("Tag endpoints authentication", () => {
    it("GET /tags should work without API key", async () => {
      await request(app.getHttpServer() as Server)
        .get("/tags")
        .expect((res) => {
          expect([200, 404]).toContain(res.status);
        });
    });

    it("POST /tags should fail without API key", async () => {
      await request(app.getHttpServer() as Server)
        .post("/tags")
        .send({})
        .expect(401);
    });

    it("GET /tags/:id should work without API key", async () => {
      await request(app.getHttpServer() as Server)
        .get("/tags/1")
        .send({})
        .expect((res) => {
          expect([200, 404]).toContain(res.status);
        });
    });

    it("DELETE /tags/:id should fail without API key", async () => {
      await request(app.getHttpServer() as Server)
        .delete("/tags/1")
        .expect(401);
    });

    it("PATCH /tags/:id should fail without API key", async () => {
      await request(app.getHttpServer() as Server)
        .patch("/tags/1")
        .expect(401);
    });
  });

  describe("Blog endpoints authentication", () => {
    it("GET /blogs should work without API key", async () => {
      await request(app.getHttpServer() as Server)
        .get("/blogs?descending=true")
        .expect((res) => {
          expect([200, 404]).toContain(res.status);
        });
    });

    it("POST /blogs should fail without API key", async () => {
      await request(app.getHttpServer() as Server)
        .post("/blogs")
        .send({})
        .expect(401);
    });

    it("GET /blogs/:id should work without API key", async () => {
      await request(app.getHttpServer() as Server)
        .get("/blogs/1")
        .send({})
        .expect((res) => {
          expect([200, 404]).toContain(res.status);
        });
    });

    it("DELETE /blogs/:id should fail without API key", async () => {
      await request(app.getHttpServer() as Server)
        .delete("/blogs/1")
        .expect(401);
    });

    it("PATCH /blogs/:id should fail without API key", async () => {
      await request(app.getHttpServer() as Server)
        .patch("/blogs/1")
        .expect(401);
    });

    it("PUT /blogs/:id should fail without API key", async () => {
      await request(app.getHttpServer() as Server)
        .put("/blogs/1")
        .expect(401);
    });
  });

  describe("Location endpoints authentication", () => {
    it("GET /locations should work without API key", async () => {
      await request(app.getHttpServer() as Server)
        .get("/locations")
        .expect((res) => {
          expect([200, 404]).toContain(res.status);
        });
    });

    it("GET /locations/:locationId should work without API key", async () => {
      await request(app.getHttpServer() as Server)
        .get("/locations/1")
        .expect((res) => {
          expect([200, 404]).toContain(res.status);
        });
    });

    it("POST /locations should fail without API key", async () => {
      await request(app.getHttpServer() as Server)
        .post("/locations")
        .expect(401);
    });

    it("PATCH /locations/:locationId should fail without API key", async () => {
      await request(app.getHttpServer() as Server)
        .patch("/locations/1")
        .expect(401);
    });

    it("DELETE /locations/:locationId should fail without API key", async () => {
      await request(app.getHttpServer() as Server)
        .delete("/locations/1")
        .expect(401);
    });
  });

  describe("Price endpoints authentication", () => {
    it("GET /prices should work without API key.", async () => {
      await request(app.getHttpServer() as Server)
        .get("/prices")
        .expect((res) => {
          expect([200, 404]).toContain(res.status);
        });
    });

    it("GET /prices/:priceId should work without API key.", async () => {
      await request(app.getHttpServer() as Server)
        .get("/prices/2")
        .expect((res) => {
          expect([200, 404]).toContain(res.status);
        });
    });

    it("POST /prices should fail without API key.", async () => {
      await request(app.getHttpServer() as Server)
        .post("/prices")
        .expect(401);
    });

    it("PATCH /prices/:priceId should fail without API key.", async () => {
      await request(app.getHttpServer() as Server)
        .patch("/prices/2")
        .expect(401);
    });

    it("DELETE /prices/:priceId should fail without API key.", async () => {
      await request(app.getHttpServer() as Server)
        .delete("/prices/2")
        .expect(401);
    });
  });

  describe("Auth endpoints authentication", () => {
    it("POST /auth/login should pass without API Key.", async () => {
      // * Note: This will return badrequest because we are passing no body.
      await request(app.getHttpServer() as Server)
        .post("/auth/login")
        .expect(400);
    });

    it("GET /auth should fail without API key.", async () => {
      await request(app.getHttpServer() as Server)
        .get("/auth")
        .expect(401);
    });

    it("POST /auth should fail without API key.", async () => {
      await request(app.getHttpServer() as Server)
        .post("/auth")
        .expect(401);
    });

    it("PATCH /auth should fail without API key.", async () => {
      await request(app.getHttpServer() as Server)
        .patch("/auth")
        .expect(401);
    });

    it("DELETE /auth/:accountId should fail without API key.", async () => {
      await request(app.getHttpServer() as Server)
        .delete("/auth/1")
        .expect(401);
    });
  });

  describe("Media Crop endpoints authentication", () => {
    it("GET /media/crops should work without API key", async () => {
      await request(app.getHttpServer() as Server)
        .get("/media/crops")
        .expect((res) => {
          expect([200, 404]).toContain(res.status);
        });
    });

    it("GET /media/crops/:cropId should work without API key", async () => {
      await request(app.getHttpServer() as Server)
        .get("/media/crops/1")
        .expect((res) => {
          expect([200, 404]).toContain(res.status);
        });
    });

    it("POST /media/crops should fail without API key", async () => {
      await request(app.getHttpServer() as Server)
        .post("/media/crops")
        .send({})
        .expect(401);
    });

    it("PUT /media/crops/:cropId should fail without API key", async () => {
      await request(app.getHttpServer() as Server)
        .put("/media/crops/1")
        .send({})
        .expect(401);
    });

    it("PATCH /media/crops/:cropId should fail without API key", async () => {
      await request(app.getHttpServer() as Server)
        .patch("/media/crops/1")
        .send({})
        .expect(401);
    });

    it("DELETE /media/crops/:cropId should fail without API key", async () => {
      await request(app.getHttpServer() as Server)
        .delete("/media/crops/1")
        .expect(401);
    });
  });

  describe("Media Item endpoints authentication", () => {
    it("GET /media/items should work without API key", async () => {
      await request(app.getHttpServer() as Server)
        .get("/media/items")
        .expect((res) => {
          expect([200, 404]).toContain(res.status);
        });
    });

    it("GET /media/items/:itemId should work without API key", async () => {
      await request(app.getHttpServer() as Server)
        .get("/media/items/1")
        .expect((res) => {
          expect([200, 404]).toContain(res.status);
        });
    });

    it("POST /media/items should fail without API key", async () => {
      await request(app.getHttpServer() as Server)
        .post("/media/items")
        .send({})
        .expect(401);
    });

    it("PUT /media/items/:itemId should fail without API key", async () => {
      await request(app.getHttpServer() as Server)
        .put("/media/items/1")
        .send({})
        .expect(401);
    });

    it("PATCH /media/items/:itemId should fail without API key", async () => {
      await request(app.getHttpServer() as Server)
        .patch("/media/items/1")
        .send({})
        .expect(401);
    });

    it("DELETE /media/items/:itemId should fail without API key", async () => {
      await request(app.getHttpServer() as Server)
        .delete("/media/items/1")
        .expect(401);
    });

    // Item <-> Crop relationship auth
    it("GET /media/items/:itemId/crops should work without API key", async () => {
      await request(app.getHttpServer() as Server)
        .get("/media/items/1/crops")
        .expect((res) => {
          expect([200, 404]).toContain(res.status);
        });
    });

    it("PUT /media/items/:itemId/crops/:cropId should fail without API key", async () => {
      await request(app.getHttpServer() as Server)
        .put("/media/items/1/crops/1")
        .expect(401);
    });

    it("DELETE /media/items/:itemId/crops/:cropId should fail without API key", async () => {
      await request(app.getHttpServer() as Server)
        .delete("/media/items/1/crops/1")
        .expect(401);
    });
  });

  describe("Media Gallery endpoints authentication", () => {
    it("GET /media/galleries should work without API key", async () => {
      await request(app.getHttpServer() as Server)
        .get("/media/galleries")
        .expect((res) => {
          expect([200, 404]).toContain(res.status);
        });
    });

    it("GET /media/galleries/:galleryId should work without API key", async () => {
      await request(app.getHttpServer() as Server)
        .get("/media/galleries/1")
        .expect((res) => {
          expect([200, 404]).toContain(res.status);
        });
    });

    it("POST /media/galleries should fail without API key", async () => {
      await request(app.getHttpServer() as Server)
        .post("/media/galleries")
        .send({})
        .expect(401);
    });

    it("DELETE /media/galleries/:galleryId should fail without API key", async () => {
      await request(app.getHttpServer() as Server)
        .delete("/media/galleries/1")
        .expect(401);
    });

    // Gallery <-> Item relationship auth
    it("GET /media/galleries/:galleryId/items should work without API key", async () => {
      await request(app.getHttpServer() as Server)
        .get("/media/galleries/1/items")
        .expect((res) => {
          expect([200, 404]).toContain(res.status);
        });
    });

    it("PUT /media/galleries/:galleryId/items/:itemId should fail without API key", async () => {
      await request(app.getHttpServer() as Server)
        .put("/media/galleries/1/items/1")
        .expect(401);
    });

    it("DELETE /media/galleries/:galleryId/items/:itemId should fail without API key", async () => {
      await request(app.getHttpServer() as Server)
        .delete("/media/galleries/1/items/1")
        .expect(401);
    });
  });
});
