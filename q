4b9fe85f apps/backend/test/app.e2e-spec.ts (Alexander Nollet 2026-02-15 16:36:39 +0100    1) import { Test, TestingModule } from "@nestjs/testing";
21f47d6f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:38:12 +0100    2) import { INestApplication } from "@nestjs/common";
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100    3) import { BlogModule } from "../src/blog/blog.module";
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100    4) import { EventModule } from "../src/event/event.module";
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100    5) import { ProductionModule } from "../src/production/production.module";
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100    6) import { TagModule } from "../src/tag/tag.module";
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100    7) import { LocationModule } from "../src/location/location.module";
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100    8) import { PriceModule } from "../src/price/price.module";
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100    9) import { BlogDatabaseService } from "../src/database/db.blog.service";
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100   10) import { EventDatabaseService } from "../src/database/db.event.service";
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100   11) import { ProductionDatabaseService } from "../src/database/db.production.service";
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100   12) import { TagDatabaseService } from "../src/database/db.tag.service";
a908a988 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 12:32:40 +0100   13) import { LocationDatabaseService } from "../src/database/db.location.service";
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100   14) import { PriceDatabaseService } from "../src/database/db.price.service";
98b18756 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-02-14 16:59:01 +0100   15) 
21f47d6f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:38:12 +0100   16) import request from "supertest";
7f815be1 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-02 17:09:14 +0100   17) import { ApiKeyGuard } from "../src/auth/authGuard";
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100   18) import { AppLogger } from "../src/util/logger/logger.service";
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100   19) import { ScraperService } from "../src/util/scraper/scraper.service";
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100   20) import { MediaModule } from "../src/media/media.module";
4c574244 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-31 14:25:45 +0200   21) import { MediaCropDatabaseService } from "../src/database/media/db.media_crop.service";
4c574244 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-31 14:25:45 +0200   22) import { MediaItemDatabaseService } from "../src/database/media/db.media_item.service";
4c574244 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-31 14:25:45 +0200   23) import { MediaGalleryDatabaseService } from "../src/database/media/db.media_gallery.service";
21f47d6f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:38:12 +0100   24) 
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100   25) // ==========================================
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100   26) // MOCK DATA (Raw & View Variants)
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100   27) // ==========================================
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100   28) 
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100   29) const mockBlog = {
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100   30)   id: 1,
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100   31)   titel: { en: "Test Blog", nl: "Test Blog" },
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100   32)   description: { en: "Test blog description", nl: "Test blog beschrijving" },
58b28077 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-08 17:15:00 +0100   33)   created_at: "2025-06-01T22:00:00.000Z",
58b28077 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-08 17:15:00 +0100   34)   updated_at: "2025-06-01T22:00:00.000Z",
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100   35) };
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100   36) const mockBlogView = {
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100   37)   ...mockBlog,
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100   38)   titel: "Test Blog",
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100   39)   description: "Test blog description",
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100   40) };
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100   41) 
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100   42) const mockBlog2 = {
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100   43)   id: 2,
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100   44)   titel: { en: "Second Blog", nl: "Tweede Blog" },
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100   45)   description: {
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100   46)     en: "Second blog description",
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100   47)     nl: "Tweede blog beschrijving",
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100   48)   },
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100   49)   created_at: "2026-03-08T00:00:00.000Z",
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100   50)   updated_at: "2026-03-08T00:00:00.000Z",
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100   51) };
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100   52) const mockBlog2View = {
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100   53)   ...mockBlog2,
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100   54)   titel: "Second Blog",
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100   55)   description: "Second blog description",
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100   56) };
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100   57) 
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100   58) const mockTag = {
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100   59)   id: 1,
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100   60)   tag: { en: "Drama", nl: "Drama" },
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100   61)   created_at: "2025-06-01T22:00:00.000Z",
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100   62)   updated_at: "2025-06-01T22:00:00.000Z",
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100   63) };
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100   64) const mockTagView = { ...mockTag, tag: "Drama" };
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100   65) 
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100   66) const mockTag2 = {
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100   67)   id: 2,
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100   68)   tag: { en: "Comedy", nl: "Komedie" },
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100   69)   created_at: "2025-06-01T22:00:00.000Z",
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100   70)   updated_at: "2025-06-01T22:00:00.000Z",
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100   71) };
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100   72) const mockTag2View = { ...mockTag2, tag: "Comedy" };
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100   73) 
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100   74) const mockProduction = {
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100   75)   id: 1,
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100   76)   titel: { en: "str", nl: "str" },
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100   77)   description1: { en: "string", nl: "string" },
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100   78)   description2: { en: "string", nl: "string" },
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100   79)   artist: { en: "string", nl: "string" },
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100   80)   tagline: { en: "string", nl: "string" },
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100   81)   credits: { en: "string", nl: "string" },
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100   82)   performer_type: "string",
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100   83)   attendance_mode: "string",
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100   84)   created_at: "2026-03-07T16:58:08.701Z",
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100   85)   updated_at: "2026-03-07T16:58:08.701Z",
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100   86) };
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100   87) const mockProductionView = {
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100   88)   ...mockProduction,
58b28077 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-08 17:15:00 +0100   89)   titel: "str",
58b28077 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-08 17:15:00 +0100   90)   description1: "string",
58b28077 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-08 17:15:00 +0100   91)   description2: "string",
58b28077 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-08 17:15:00 +0100   92)   artist: "string",
58b28077 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-08 17:15:00 +0100   93)   tagline: "string",
58b28077 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-08 17:15:00 +0100   94)   credits: "string",
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100   95) };
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100   96) 
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100   97) const mockEvent = {
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100   98)   id: 1,
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100   99)   starttime: "2025-01-01T19:00:00.000Z",
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  100)   endtime: "2025-01-01T22:00:00.000Z",
58b28077 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-08 17:15:00 +0100  101)   doors_at: "2025-06-01T22:00:00.000Z",
58b28077 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-08 17:15:00 +0100  102)   intermission_at: "2025-06-01T22:00:00.000Z",
58b28077 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-08 17:15:00 +0100  103)   created_at: "2026-03-07T00:00:00.000Z",
58b28077 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-08 17:15:00 +0100  104)   updated_at: "2026-03-07T00:00:00.000Z",
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  105)   production_id: 1,
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  106) };
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  107) 
a908a988 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 12:32:40 +0100  108) const mockLocation = {
a908a988 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 12:32:40 +0100  109)   id: 1,
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  110)   location: { en: "Main Stage", nl: "Hoofdpodium" },
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  111)   created_at: "2025-06-01T22:00:00.000Z",
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  112)   updated_at: "2025-06-01T22:00:00.000Z",
a908a988 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 12:32:40 +0100  113) };
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  114) const mockLocationView = { ...mockLocation, location: "Main Stage" };
a908a988 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 12:32:40 +0100  115) 
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100  116) const mockPrice = {
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100  117)   id: 1,
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100  118)   price: 15.5,
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  119)   name: { en: "Early Bird", nl: "Vroege Vogel" },
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  120)   created_at: "2025-06-01T22:00:00.000Z",
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  121)   updated_at: "2025-06-01T22:00:00.000Z",
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100  122) };
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  123) const mockPriceView = { ...mockPrice, name: "Early Bird" };
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100  124) 
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  125) // ==========================================
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  126) // Mock DB service factories
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  127) // ==========================================
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  128) 
a908a988 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 12:32:40 +0100  129) const mockLocationDbService = () => ({
a908a988 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 12:32:40 +0100  130)   getLocations: jest.fn().mockResolvedValue([mockLocation]),
a908a988 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 12:32:40 +0100  131)   getLocationById: jest.fn().mockResolvedValue(mockLocation),
a908a988 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 12:32:40 +0100  132)   createLocation: jest.fn().mockResolvedValue(mockLocation),
a908a988 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 12:32:40 +0100  133)   updateLocation: jest.fn().mockResolvedValue(mockLocation),
a908a988 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 12:32:40 +0100  134)   deleteLocation: jest.fn().mockResolvedValue(undefined),
a908a988 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 12:32:40 +0100  135) });
a908a988 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 12:32:40 +0100  136) 
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  137) const mockBlogDbService = () => ({
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  138)   getBlogs: jest.fn().mockResolvedValue([mockBlog, mockBlog2]),
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  139)   getBlogById: jest.fn().mockResolvedValue(mockBlog),
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  140)   createBlog: jest.fn().mockResolvedValue(mockBlog),
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  141)   updateBlog: jest.fn().mockResolvedValue(mockBlog),
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  142)   deleteBlog: jest.fn().mockResolvedValue(undefined),
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  143) });
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  144) 
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  145) const mockEventDbService = () => ({
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  146)   getEvents: jest.fn().mockResolvedValue([mockEvent]),
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  147)   getEventById: jest.fn().mockResolvedValue(mockEvent),
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  148)   createEvent: jest.fn().mockResolvedValue(mockEvent),
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  149)   updateEvent: jest.fn().mockResolvedValue(mockEvent),
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  150)   deleteEvent: jest.fn().mockResolvedValue(undefined),
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  151)   getBlogsOfEvent: jest.fn().mockResolvedValue([mockBlog]),
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  152)   linkBlogWithEventID: jest.fn().mockResolvedValue(undefined),
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  153)   deleteBlogFromEvent: jest.fn().mockResolvedValue(undefined),
a908a988 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 12:32:40 +0100  154)   getLocationOfEvent: jest.fn().mockResolvedValue(mockLocation),
a908a988 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 12:32:40 +0100  155)   linkEventToLocation: jest.fn().mockResolvedValue(true),
a908a988 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 12:32:40 +0100  156)   deleteLocationFromEvent: jest.fn().mockResolvedValue(undefined),
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100  157)   getPricesOfEvent: jest.fn().mockResolvedValue([mockPrice]),
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100  158)   addPriceToEvent: jest.fn().mockResolvedValue(true),
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100  159)   removePriceFromEvent: jest.fn().mockResolvedValue(undefined),
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  160) });
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  161) 
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  162) const mockProductionDbService = () => ({
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  163)   getProductions: jest.fn().mockResolvedValue([mockProduction]),
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  164)   getProductionById: jest.fn().mockResolvedValue(mockProduction),
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  165)   createProduction: jest.fn().mockResolvedValue(mockProduction),
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  166)   updateProduction: jest.fn().mockResolvedValue(mockProduction),
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  167)   upsertProduction: jest.fn().mockResolvedValue(mockProduction),
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  168)   deleteProduction: jest.fn().mockResolvedValue(undefined),
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  169)   getBlogsOfProduction: jest.fn().mockResolvedValue([mockBlog]),
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  170)   linkBlogWithProductionID: jest.fn().mockResolvedValue(undefined),
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  171)   deleteBlogFromProduction: jest.fn().mockResolvedValue(undefined),
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  172)   getTagsOfProduction: jest.fn().mockResolvedValue([mockTag]),
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  173)   addTagToProduction: jest.fn().mockResolvedValue(undefined),
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  174)   removeTagFromProduction: jest.fn().mockResolvedValue(undefined),
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  175) });
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  176) 
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  177) const mockTagDbService = () => ({
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  178)   getTags: jest.fn().mockResolvedValue([mockTag, mockTag2]),
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  179)   getTagById: jest.fn().mockResolvedValue(mockTag),
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  180)   createTag: jest.fn().mockResolvedValue(mockTag),
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  181)   updateTag: jest.fn().mockResolvedValue(mockTag),
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  182)   deleteTag: jest.fn().mockResolvedValue(undefined),
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  183) });
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  184) 
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100  185) const mockPriceDbService = () => ({
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100  186)   getPrices: jest.fn().mockResolvedValue([mockPrice]),
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100  187)   getPriceById: jest.fn().mockResolvedValue(mockPrice),
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100  188)   createPrice: jest.fn().mockResolvedValue(mockPrice),
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100  189)   updatePrice: jest.fn().mockResolvedValue(mockPrice),
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100  190)   deletePrice: jest.fn().mockResolvedValue(undefined),
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100  191) });
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100  192) 
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  193) // ==========================================
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  194) // MOCK DATA (Media)
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  195) // ==========================================
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  196) 
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  197) const mockMediaCrop = {
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  198)   id: 1,
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  199)   name: "hd_ready",
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  200)   url: "https://example.com/crop.jpg",
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  201)   created_at: "2026-03-28T14:00:00.000Z",
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  202)   updated_at: "2026-03-28T14:00:00.000Z",
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  203) };
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  204) 
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  205) const mockMediaItem = {
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  206)   id: 1,
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  207)   type: "image",
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  208)   original_filename: "test.png",
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  209)   position: "main",
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  210)   width: 1920,
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  211)   height: 1080,
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  212)   title: { en: "Test Media", nl: "Test Media" },
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  213)   description: { en: "Desc", nl: "Beschrijving" },
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  214)   credits: { en: "Credits", nl: "Credits" },
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  215)   created_at: "2026-03-28T14:00:00.000Z",
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  216)   updated_at: "2026-03-28T14:00:00.000Z",
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  217) };
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  218) 
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  219) const mockMediaItemView = {
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  220)   ...mockMediaItem,
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  221)   title: "Test Media",
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  222)   description: "Desc",
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  223)   credits: "Credits",
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  224) };
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  225) 
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  226) const mockMediaGallery = {
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  227)   id: 1,
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  228)   created_at: "2026-03-28T14:00:00.000Z",
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  229)   updated_at: "2026-03-28T14:00:00.000Z",
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  230) };
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  231) 
bc247248 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-30 16:56:22 +0200  232) // @ts-ignore
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  233) const paginatedResponse = (objects) => ({
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  234)   objects,
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  235)   totalItems: 1,
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  236)   page: 1,
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  237)   limit: 10,
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  238) });
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  239) 
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  240) // ==========================================
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  241) // Mock DB service factory (Media)
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  242) // ==========================================
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  243) 
4c574244 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-31 14:25:45 +0200  244) const mockMediaCropsDbService = () => ({
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  245)   // Crops
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  246)   getAllCrops: jest.fn().mockResolvedValue(paginatedResponse([mockMediaCrop])),
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  247)   getCropById: jest.fn().mockResolvedValue(mockMediaCrop),
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  248)   createCrop: jest.fn().mockResolvedValue(mockMediaCrop),
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  249)   updateCrop: jest.fn().mockResolvedValue(mockMediaCrop),
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  250)   deleteCrop: jest.fn().mockResolvedValue(undefined),
4c574244 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-31 14:25:45 +0200  251) });
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  252) 
4c574244 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-31 14:25:45 +0200  253) const mockMediaItemsDbService = () => ({
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  254)   // Items
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  255)   getAllItems: jest.fn().mockResolvedValue(paginatedResponse([mockMediaItem])),
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  256)   getItemById: jest.fn().mockResolvedValue(mockMediaItem),
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  257)   createItem: jest.fn().mockResolvedValue(mockMediaItem),
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  258)   updateItem: jest.fn().mockResolvedValue(mockMediaItem),
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  259)   deleteItem: jest.fn().mockResolvedValue(undefined),
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  260)   getCropsByItem: jest.fn().mockResolvedValue([mockMediaCrop]),
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  261)   linkCropToItem: jest.fn().mockResolvedValue(undefined),
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  262)   unlinkCropFromItem: jest.fn().mockResolvedValue(undefined),
4c574244 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-31 14:25:45 +0200  263) });
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  264) 
4c574244 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-31 14:25:45 +0200  265) const mockMediaGalleryDbService = () => ({
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  266)   // Galleries
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  267)   getGalleries: jest
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  268)     .fn()
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  269)     .mockResolvedValue(paginatedResponse([mockMediaGallery])),
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  270)   getGalleryById: jest.fn().mockResolvedValue(mockMediaGallery),
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  271)   createGallery: jest.fn().mockResolvedValue(mockMediaGallery),
4c574244 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-31 14:25:45 +0200  272)   updateGallery: jest.fn().mockResolvedValue(mockMediaGallery),
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  273)   deleteGallery: jest.fn().mockResolvedValue(undefined),
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  274)   getItemsByGallery: jest.fn().mockResolvedValue([mockMediaItem]),
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  275)   linkItemToGallery: jest.fn().mockResolvedValue(undefined),
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  276)   unlinkItemFromGallery: jest.fn().mockResolvedValue(undefined),
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  277) });
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  278) 
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  279) // Helper: build app with all modules
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  280) async function buildApp(): Promise<INestApplication> {
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  281)   const moduleFixture: TestingModule = await Test.createTestingModule({
a908a988 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 12:32:40 +0100  282)     imports: [
a908a988 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 12:32:40 +0100  283)       BlogModule,
a908a988 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 12:32:40 +0100  284)       EventModule,
a908a988 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 12:32:40 +0100  285)       ProductionModule,
a908a988 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 12:32:40 +0100  286)       TagModule,
a908a988 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 12:32:40 +0100  287)       LocationModule,
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100  288)       PriceModule,
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100  289)       MediaModule,
a908a988 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 12:32:40 +0100  290)     ],
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  291)   })
7f815be1 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-02 17:09:14 +0100  292)     .overrideGuard(ApiKeyGuard)
a908a988 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 12:32:40 +0100  293)     .useValue({ canActivate: jest.fn(() => true) })
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  294)     .overrideProvider(BlogDatabaseService)
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  295)     .useFactory({ factory: mockBlogDbService })
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  296)     .overrideProvider(EventDatabaseService)
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  297)     .useFactory({ factory: mockEventDbService })
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  298)     .overrideProvider(ProductionDatabaseService)
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  299)     .useFactory({ factory: mockProductionDbService })
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  300)     .overrideProvider(TagDatabaseService)
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  301)     .useFactory({ factory: mockTagDbService })
a908a988 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 12:32:40 +0100  302)     .overrideProvider(LocationDatabaseService)
a908a988 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 12:32:40 +0100  303)     .useFactory({ factory: mockLocationDbService })
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  304)     .overrideProvider(PriceDatabaseService)
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100  305)     .useFactory({ factory: mockPriceDbService })
4c574244 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-31 14:25:45 +0200  306)     .overrideProvider(MediaItemDatabaseService)
4c574244 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-31 14:25:45 +0200  307)     .useFactory({ factory: mockMediaItemsDbService })
4c574244 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-31 14:25:45 +0200  308)     .overrideProvider(MediaGalleryDatabaseService)
4c574244 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-31 14:25:45 +0200  309)     .useFactory({ factory: mockMediaGalleryDbService })
4c574244 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-31 14:25:45 +0200  310)     .overrideProvider(MediaCropDatabaseService)
4c574244 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-31 14:25:45 +0200  311)     .useFactory({ factory: mockMediaCropsDbService })
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  312)     .overrideProvider(AppLogger) // We override these so they don't make a fuss during testing.
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  313)     .useValue({
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  314)       log: jest.fn(),
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  315)       error: jest.fn(),
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  316)       warn: jest.fn(),
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  317)       debug: jest.fn(),
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  318)       verbose: jest.fn(),
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  319)     })
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  320)     .overrideProvider(ScraperService)
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  321)     .useValue({
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  322)       onApplicationBootstrap: jest.fn(),
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  323)       handleDailyScrape: jest.fn(),
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  324)     })
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  325)     .compile();
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  326) 
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  327)   const app = moduleFixture.createNestApplication();
80c2ab66 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-03-01 17:36:21 +0100  328)   app.useLogger(false);
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  329)   await app.init();
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  330)   return app;
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  331) }
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  332) 
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100  333) // ==========================================
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  334) // BLOG endpoints
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100  335) // ==========================================
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  336) 
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  337) describe("BlogController (e2e)", () => {
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  338)   let app: INestApplication;
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  339)   let blogDb: BlogDatabaseService;
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  340) 
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  341)   beforeEach(async () => {
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  342)     app = await buildApp();
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  343)     blogDb = app.get<BlogDatabaseService>(BlogDatabaseService);
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  344)   });
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  345) 
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  346)   afterEach(async () => {
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  347)     await app.close();
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  348)   });
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  349) 
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  350)   describe("GET /blogs", () => {
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  351)     it("should return 200 with an array of flattened blogs", () => {
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  352)       return request(app.getHttpServer())
ca203747 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-20 15:38:40 +0100  353)         .get("/blogs?lang=en&descending=true")
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  354)         .expect(200)
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  355)         .expect([mockBlogView, mockBlog2View]);
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  356)     });
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  357) 
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  358)     it("should call blogDb.getBlogs()", async () => {
ca203747 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-20 15:38:40 +0100  359)       await request(app.getHttpServer()).get("/blogs?lang=en&descending=true");
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  360)       expect(blogDb.getBlogs).toHaveBeenCalled();
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  361)     });
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  362) 
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  363)     it("should return 200 with an empty array when no blogs exist", async () => {
3b0cb41f backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-21 21:38:18 +0100  364)       // @ts-ignore
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  365)       jest.spyOn(blogDb, "getBlogs").mockResolvedValueOnce([]);
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  366)       return request(app.getHttpServer())
ca203747 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-20 15:38:40 +0100  367)         .get("/blogs?lang=en&descending=true")
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  368)         .expect(200)
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  369)         .expect([]);
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  370)     });
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  371)   });
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  372) 
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  373)   describe("GET /blogs/:id", () => {
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  374)     it("should return 200 with the correct flattened blog", () => {
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  375)       return request(app.getHttpServer())
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  376)         .get("/blogs/1?lang=en")
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  377)         .expect(200)
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  378)         .expect(mockBlogView);
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  379)     });
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  380) 
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  381)     it("should call blogDb.getBlogById with the correct id", async () => {
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  382)       await request(app.getHttpServer()).get("/blogs/1?lang=en");
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  383)       expect(blogDb.getBlogById).toHaveBeenCalledWith(1);
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  384)     });
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  385) 
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  386)     it("should return 400 when id is not a number", () => {
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  387)       return request(app.getHttpServer()).get("/blogs/abc").expect(400);
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  388)     });
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  389) 
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  390)     it("should propagate errors from the database", async () => {
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  391)       jest
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  392)         .spyOn(blogDb, "getBlogById")
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  393)         .mockRejectedValueOnce(new Error("Not Found"));
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  394)       return request(app.getHttpServer()).get("/blogs/999?lang=en").expect(500);
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  395)     });
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  396)   });
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  397) 
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  398)   describe("POST /blogs", () => {
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  399)     const createPayload = {
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  400)       titel: { en: "New Blog", nl: "Nieuwe Blog" },
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  401)       description: { en: "New description", nl: "Nieuwe beschrijving" },
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  402)     };
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  403) 
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  404)     it("should return 201 with the created blog", () => {
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  405)       return request(app.getHttpServer())
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  406)         .post("/blogs")
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  407)         .send(createPayload)
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  408)         .expect(201)
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  409)         .expect(mockBlog);
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  410)     });
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  411) 
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  412)     it("should call blogDb.createBlog with the payload", async () => {
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  413)       await request(app.getHttpServer()).post("/blogs").send(createPayload);
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  414)       expect(blogDb.createBlog).toHaveBeenCalledWith(createPayload);
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  415)     });
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  416) 
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  417)     it("should return 400 when body is missing required fields", () => {
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  418)       return request(app.getHttpServer())
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  419)         .post("/blogs")
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  420)         .send({ titel: { en: "Only title" } })
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  421)         .expect(400);
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  422)     });
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  423)   });
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  424) 
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  425)   describe("PUT /blogs/:id", () => {
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  426)     it("should return 200 with the replaced blog when ids match", () => {
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  427)       return request(app.getHttpServer())
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  428)         .put("/blogs/1")
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  429)         .send(mockBlog)
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  430)         .expect(200)
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  431)         .expect(mockBlog);
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  432)     });
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  433) 
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  434)     it("should return 400 when id param is not a number", () => {
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  435)       return request(app.getHttpServer())
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  436)         .put("/blogs/abc")
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  437)         .send(mockBlog)
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  438)         .expect(400);
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  439)     });
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  440)   });
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  441) 
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  442)   describe("PATCH /blogs/:id", () => {
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  443)     it("should return 200 with the modified blog", () => {
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  444)       return request(app.getHttpServer())
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  445)         .patch("/blogs/1")
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  446)         .send({ titel: { en: "Updated title", nl: "Bijgewerkte titel" } })
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  447)         .expect(200)
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  448)         .expect(mockBlog);
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  449)     });
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  450) 
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  451)     it("should call blogDb.updateBlog", async () => {
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  452)       await request(app.getHttpServer())
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  453)         .patch("/blogs/1")
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  454)         .send({ titel: { en: "Updated title", nl: "Bijgewerkte titel" } });
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  455)       expect(blogDb.updateBlog).toHaveBeenCalled();
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  456)     });
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  457) 
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  458)     it("should return 400 when id is not a number", () => {
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  459)       return request(app.getHttpServer())
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  460)         .patch("/blogs/abc")
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  461)         .send({ titel: { en: "Updated title", nl: "Bijgewerkte titel" } })
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  462)         .expect(400);
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  463)     });
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  464)   });
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  465) 
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  466)   describe("DELETE /blogs/:id", () => {
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  467)     it("should return 200 when blog is deleted", () => {
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  468)       return request(app.getHttpServer()).delete("/blogs/1").expect(200);
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  469)     });
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  470) 
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  471)     it("should call blogDb.deleteBlog with the correct id", async () => {
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  472)       await request(app.getHttpServer()).delete("/blogs/1");
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  473)       expect(blogDb.deleteBlog).toHaveBeenCalledWith(1);
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  474)     });
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  475) 
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  476)     it("should return 400 when id is not a number", () => {
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  477)       return request(app.getHttpServer()).delete("/blogs/abc").expect(400);
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  478)     });
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  479)   });
80de2c2f backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 18:35:59 +0100  480) });
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  481) 
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100  482) // ==========================================
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  483) // TAG endpoints
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100  484) // ==========================================
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  485) 
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  486) describe("TagController (e2e)", () => {
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  487)   let app: INestApplication;
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  488)   let tagDb: TagDatabaseService;
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  489) 
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  490)   beforeEach(async () => {
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  491)     app = await buildApp();
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  492)     tagDb = app.get<TagDatabaseService>(TagDatabaseService);
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  493)   });
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  494) 
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  495)   afterEach(async () => {
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  496)     await app.close();
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  497)   });
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  498) 
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  499)   describe("GET /tags", () => {
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  500)     it("should return 200 with an array of flattened tags", () => {
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  501)       return request(app.getHttpServer())
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  502)         .get("/tags?lang=en")
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  503)         .expect(200)
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  504)         .expect([mockTagView, mockTag2View]);
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  505)     });
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  506) 
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  507)     it("should return 200 with empty array when no tags exist", async () => {
3b0cb41f backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-21 21:38:18 +0100  508)       // @ts-ignore
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  509)       jest.spyOn(tagDb, "getTags").mockResolvedValueOnce([]);
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  510)       return request(app.getHttpServer())
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  511)         .get("/tags?lang=en")
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  512)         .expect(200)
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  513)         .expect([]);
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  514)     });
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  515)   });
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  516) 
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  517)   describe("GET /tags/:id", () => {
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  518)     it("should return 200 with the correct flattened tag", () => {
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  519)       return request(app.getHttpServer())
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  520)         .get("/tags/1?lang=en")
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  521)         .expect(200)
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  522)         .expect(mockTagView);
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  523)     });
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  524) 
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  525)     it("should call tagDb.getTagById with the correct id", async () => {
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  526)       await request(app.getHttpServer()).get("/tags/1?lang=en");
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  527)       expect(tagDb.getTagById).toHaveBeenCalledWith(1);
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  528)     });
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  529) 
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  530)     it("should return 400 when id is not a number", () => {
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  531)       return request(app.getHttpServer()).get("/tags/abc").expect(400);
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  532)     });
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  533)   });
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  534) 
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  535)   describe("POST /tags", () => {
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  536)     const createPayload = {
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  537)       tag: { en: "Thriller", nl: "Thriller" },
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  538)     };
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  539) 
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  540)     it("should return 201 with the created tag", () => {
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  541)       return request(app.getHttpServer())
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  542)         .post("/tags")
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  543)         .send(createPayload)
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  544)         .expect(201)
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  545)         .expect(mockTag);
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  546)     });
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  547) 
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  548)     it("should call tagDb.createTag with the payload", async () => {
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  549)       await request(app.getHttpServer()).post("/tags").send(createPayload);
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  550)       expect(tagDb.createTag).toHaveBeenCalledWith(createPayload);
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  551)     });
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  552) 
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  553)     it("should return 400 when body is missing required field 'tag'", () => {
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  554)       return request(app.getHttpServer()).post("/tags").send({}).expect(400);
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  555)     });
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  556)   });
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  557) 
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  558)   describe("PATCH /tags/:id", () => {
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  559)     it("should return 200 with the updated tag", () => {
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  560)       return request(app.getHttpServer())
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  561)         .patch("/tags/1")
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  562)         .send({ tag: { en: "Thriller", nl: "Thriller" } })
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  563)         .expect(200)
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  564)         .expect(mockTag);
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  565)     });
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  566) 
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  567)     it("should return 400 when id is not a number", () => {
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  568)       return request(app.getHttpServer())
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  569)         .patch("/tags/abc")
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  570)         .send({ tag: { en: "Something", nl: "Iets" } })
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  571)         .expect(400);
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  572)     });
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  573)   });
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  574) 
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  575)   describe("DELETE /tags/:id", () => {
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  576)     it("should return 200 with a success message", async () => {
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  577)       const response = await request(app.getHttpServer())
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  578)         .delete("/tags/1")
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  579)         .expect(200);
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  580)       expect(response.body).toHaveProperty("message");
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  581)       expect(response.body.message).toContain("1");
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  582)     });
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  583) 
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  584)     it("should call tagDb.deleteTag with the correct id", async () => {
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  585)       await request(app.getHttpServer()).delete("/tags/1");
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  586)       expect(tagDb.deleteTag).toHaveBeenCalledWith(1);
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  587)     });
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  588) 
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  589)     it("should return 400 when id is not a number", () => {
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  590)       return request(app.getHttpServer()).delete("/tags/abc").expect(400);
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  591)     });
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  592)   });
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  593) });
b01b870a backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 19:42:49 +0100  594) 
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100  595) // ==========================================
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  596) // PRODUCTION endpoints
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100  597) // ==========================================
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  598) 
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  599) describe("ProductionController (e2e)", () => {
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  600)   let app: INestApplication;
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  601)   let productionDb: ProductionDatabaseService;
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  602) 
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  603)   beforeEach(async () => {
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  604)     app = await buildApp();
89430238 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-02 21:00:43 +0100  605)     productionDb = app.get<ProductionDatabaseService>(
89430238 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-02 21:00:43 +0100  606)       ProductionDatabaseService,
89430238 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-02 21:00:43 +0100  607)     );
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  608)   });
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  609) 
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  610)   afterEach(async () => {
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  611)     await app.close();
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  612)   });
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  613) 
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  614)   describe("GET /productions", () => {
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  615)     it("should return 200 with an array of flattened productions", () => {
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  616)       return request(app.getHttpServer())
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  617)         .get("/productions?lang=en")
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  618)         .expect(200)
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  619)         .expect([mockProductionView]);
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  620)     });
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  621) 
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  622)     it("should return 200 with empty array when no productions exist", async () => {
3b0cb41f backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-21 21:38:18 +0100  623)       // @ts-ignore
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  624)       jest.spyOn(productionDb, "getProductions").mockResolvedValueOnce([]);
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  625)       return request(app.getHttpServer())
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  626)         .get("/productions?lang=en")
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  627)         .expect(200)
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  628)         .expect([]);
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  629)     });
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  630)   });
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  631) 
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  632)   describe("GET /productions/:productionId", () => {
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  633)     it("should return 200 with the correct flattened production", () => {
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  634)       return request(app.getHttpServer())
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  635)         .get("/productions/1?lang=en")
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  636)         .expect(200)
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  637)         .expect(mockProductionView);
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  638)     });
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  639) 
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  640)     it("should call productionDb.getProductionById with the correct id", async () => {
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  641)       await request(app.getHttpServer()).get("/productions/1?lang=en");
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  642)       expect(productionDb.getProductionById).toHaveBeenCalledWith(1);
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  643)     });
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  644) 
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  645)     it("should return 400 when id is not a number", () => {
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  646)       return request(app.getHttpServer()).get("/productions/abc").expect(400);
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  647)     });
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  648)   });
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  649) 
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  650)   describe("POST /productions", () => {
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  651)     const createPayload = {
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  652)       titel: { en: "New Production", nl: "Nieuwe Productie" },
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  653)       description1: { en: "Desc 1", nl: "Beschrijving 1" },
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  654)       description2: { en: "Desc 2", nl: "Beschrijving 2" },
58b28077 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-08 17:15:00 +0100  655)       attendance_mode: "etst",
58b28077 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-08 17:15:00 +0100  656)       performer_type: "etst",
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  657)       tagline: { en: "test", nl: "test" },
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  658)       credits: { en: "test", nl: "test" },
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  659)       artist: { en: "test", nl: "test" },
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  660)     };
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  661) 
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  662)     it("should return 201 with the created production", () => {
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  663)       return request(app.getHttpServer())
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  664)         .post("/productions")
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  665)         .send(createPayload)
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  666)         .expect(201)
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  667)         .expect(mockProduction);
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  668)     });
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  669) 
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  670)     it("should call productionDb.createProduction with the payload", async () => {
89430238 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-02 21:00:43 +0100  671)       await request(app.getHttpServer())
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  672)         .post("/productions")
89430238 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-02 21:00:43 +0100  673)         .send(createPayload);
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  674)       expect(productionDb.createProduction).toHaveBeenCalledWith(createPayload);
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  675)     });
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  676) 
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  677)     it("should return 400 when required fields are missing", () => {
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  678)       return request(app.getHttpServer())
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  679)         .post("/productions")
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  680)         .send({ titel: { en: "Incomplete", nl: "Incompleet" } })
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  681)         .expect(400);
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  682)     });
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  683)   });
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  684) 
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  685)   describe("PUT /productions/:productionId", () => {
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  686)     it("should return 200 with the replaced production when ids match", () => {
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  687)       return request(app.getHttpServer())
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  688)         .put("/productions/1")
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  689)         .send(mockProduction)
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  690)         .expect(200)
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  691)         .expect(mockProduction);
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  692)     });
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  693) 
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  694)     it("should return 400 when id is not a number", () => {
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  695)       return request(app.getHttpServer())
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  696)         .put("/productions/abc")
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  697)         .send(mockProduction)
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  698)         .expect(400);
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  699)     });
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  700)   });
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  701) 
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  702)   describe("PATCH /productions/:productionId", () => {
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  703)     it("should return 200 with the modified production", () => {
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  704)       return request(app.getHttpServer())
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  705)         .patch("/productions/1")
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  706)         .send({ titel: { en: "Patched titel", nl: "Bijgewerkte titel" } })
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  707)         .expect(200)
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  708)         .expect(mockProduction);
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  709)     });
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  710) 
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  711)     it("should call productionDb.updateProduction", async () => {
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  712)       await request(app.getHttpServer())
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  713)         .patch("/productions/1")
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  714)         .send({ titel: { en: "Patched titel", nl: "Bijgewerkte titel" } });
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  715)       expect(productionDb.updateProduction).toHaveBeenCalled();
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  716)     });
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  717) 
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  718)     it("should return 400 when id is not a number", () => {
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  719)       return request(app.getHttpServer())
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  720)         .patch("/productions/abc")
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  721)         .send({ titel: { en: "Patched", nl: "Gepatched" } })
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  722)         .expect(400);
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  723)     });
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  724)   });
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  725) 
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  726)   describe("DELETE /productions/:productionId", () => {
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  727)     it("should return 200 when production is deleted", () => {
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  728)       return request(app.getHttpServer()).delete("/productions/1").expect(200);
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  729)     });
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  730) 
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  731)     it("should call productionDb.deleteProduction with the correct id", async () => {
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  732)       await request(app.getHttpServer()).delete("/productions/1");
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  733)       expect(productionDb.deleteProduction).toHaveBeenCalledWith(1);
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  734)     });
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  735) 
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  736)     it("should return 400 when id is not a number", () => {
2d8c9aa1 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-05 17:00:42 +0100  737)       return request(app.getHttpServer())
2d8c9aa1 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-05 17:00:42 +0100  738)         .delete("/productions/abc")
2d8c9aa1 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-05 17:00:42 +0100  739)         .expect(400);
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  740)     });
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  741)   });
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  742) });
b06a7043 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-27 20:21:49 +0100  743) 
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100  744) // ==========================================
05de2144 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:25:08 +0100  745) // PRODUCTION - BLOG relationship endpoints
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100  746) // ==========================================
05de2144 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:25:08 +0100  747) 
05de2144 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:25:08 +0100  748) describe("ProductionBlogController (e2e)", () => {
05de2144 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:25:08 +0100  749)   let app: INestApplication;
05de2144 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:25:08 +0100  750)   let productionDb: ProductionDatabaseService;
05de2144 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:25:08 +0100  751) 
05de2144 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:25:08 +0100  752)   beforeEach(async () => {
05de2144 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:25:08 +0100  753)     app = await buildApp();
89430238 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-02 21:00:43 +0100  754)     productionDb = app.get<ProductionDatabaseService>(
89430238 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-02 21:00:43 +0100  755)       ProductionDatabaseService,
89430238 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-02 21:00:43 +0100  756)     );
05de2144 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:25:08 +0100  757)   });
05de2144 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:25:08 +0100  758) 
05de2144 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:25:08 +0100  759)   afterEach(async () => {
05de2144 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:25:08 +0100  760)     await app.close();
05de2144 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:25:08 +0100  761)   });
05de2144 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:25:08 +0100  762) 
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  763)   describe("GET /productions/:productionId/blogs", () => {
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  764)     it("should return 200 with flattened blogs linked to the production", () => {
05de2144 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:25:08 +0100  765)       return request(app.getHttpServer())
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  766)         .get("/productions/1/blogs?lang=en")
05de2144 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:25:08 +0100  767)         .expect(200)
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  768)         .expect([mockBlogView]);
05de2144 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:25:08 +0100  769)     });
05de2144 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:25:08 +0100  770) 
05de2144 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:25:08 +0100  771)     it("should call productionDb.getBlogsOfProduction with the correct id", async () => {
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  772)       await request(app.getHttpServer()).get("/productions/1/blogs?lang=en");
05de2144 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:25:08 +0100  773)       expect(productionDb.getBlogsOfProduction).toHaveBeenCalledWith(1);
05de2144 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:25:08 +0100  774)     });
05de2144 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:25:08 +0100  775) 
05de2144 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:25:08 +0100  776)     it("should return 400 when productionId is not a number", () => {
05de2144 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:25:08 +0100  777)       return request(app.getHttpServer())
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  778)         .get("/productions/abc/blogs")
05de2144 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:25:08 +0100  779)         .expect(400);
05de2144 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:25:08 +0100  780)     });
05de2144 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:25:08 +0100  781)   });
05de2144 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:25:08 +0100  782) 
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  783)   describe("PUT /productions/:productionId/blogs/:blogId", () => {
05de2144 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:25:08 +0100  784)     it("should return 200 with the linked blog", () => {
05de2144 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:25:08 +0100  785)       return request(app.getHttpServer())
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  786)         .put("/productions/1/blogs/1")
05de2144 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:25:08 +0100  787)         .expect(200)
05de2144 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:25:08 +0100  788)         .expect(mockBlog);
05de2144 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:25:08 +0100  789)     });
05de2144 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:25:08 +0100  790) 
05de2144 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:25:08 +0100  791)     it("should call productionDb.linkBlogWithProductionID with correct ids", async () => {
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  792)       await request(app.getHttpServer()).put("/productions/1/blogs/2");
05de2144 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:25:08 +0100  793)       expect(productionDb.linkBlogWithProductionID).toHaveBeenCalledWith(2, 1);
05de2144 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:25:08 +0100  794)     });
05de2144 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:25:08 +0100  795) 
05de2144 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:25:08 +0100  796)     it("should return 400 when productionId is not a number", () => {
05de2144 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:25:08 +0100  797)       return request(app.getHttpServer())
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  798)         .put("/productions/abc/blogs/1")
05de2144 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:25:08 +0100  799)         .expect(400);
05de2144 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:25:08 +0100  800)     });
05de2144 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:25:08 +0100  801) 
05de2144 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:25:08 +0100  802)     it("should return 400 when blogId is not a number", () => {
05de2144 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:25:08 +0100  803)       return request(app.getHttpServer())
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  804)         .put("/productions/1/blogs/abc")
05de2144 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:25:08 +0100  805)         .expect(400);
05de2144 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:25:08 +0100  806)     });
05de2144 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:25:08 +0100  807)   });
05de2144 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:25:08 +0100  808) 
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  809)   describe("DELETE /productions/:productionId/blogs/:blogId", () => {
05de2144 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:25:08 +0100  810)     it("should return 200 with the production after unlinking", () => {
05de2144 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:25:08 +0100  811)       return request(app.getHttpServer())
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  812)         .delete("/productions/1/blogs/1")
05de2144 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:25:08 +0100  813)         .expect(200)
05de2144 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:25:08 +0100  814)         .expect(mockProduction);
05de2144 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:25:08 +0100  815)     });
05de2144 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:25:08 +0100  816) 
05de2144 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:25:08 +0100  817)     it("should call productionDb.deleteBlogFromProduction with correct ids", async () => {
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  818)       await request(app.getHttpServer()).delete("/productions/1/blogs/2");
05de2144 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:25:08 +0100  819)       expect(productionDb.deleteBlogFromProduction).toHaveBeenCalledWith(1, 2);
05de2144 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:25:08 +0100  820)     });
05de2144 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:25:08 +0100  821) 
05de2144 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:25:08 +0100  822)     it("should return 400 when productionId is not a number", () => {
05de2144 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:25:08 +0100  823)       return request(app.getHttpServer())
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  824)         .delete("/productions/abc/blogs/1")
05de2144 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:25:08 +0100  825)         .expect(400);
05de2144 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:25:08 +0100  826)     });
05de2144 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:25:08 +0100  827)   });
05de2144 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:25:08 +0100  828) });
14842284 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:46:47 +0100  829) 
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100  830) // ==========================================
14842284 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:46:47 +0100  831) // PRODUCTION - TAG relationship endpoints
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100  832) // ==========================================
14842284 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:46:47 +0100  833) 
14842284 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:46:47 +0100  834) describe("ProductionTagController (e2e)", () => {
14842284 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:46:47 +0100  835)   let app: INestApplication;
14842284 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:46:47 +0100  836)   let productionDb: ProductionDatabaseService;
14842284 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:46:47 +0100  837) 
14842284 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:46:47 +0100  838)   beforeEach(async () => {
14842284 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:46:47 +0100  839)     app = await buildApp();
89430238 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-02 21:00:43 +0100  840)     productionDb = app.get<ProductionDatabaseService>(
89430238 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-02 21:00:43 +0100  841)       ProductionDatabaseService,
89430238 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-02 21:00:43 +0100  842)     );
14842284 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:46:47 +0100  843)   });
14842284 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:46:47 +0100  844) 
14842284 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:46:47 +0100  845)   afterEach(async () => {
14842284 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:46:47 +0100  846)     await app.close();
14842284 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:46:47 +0100  847)   });
14842284 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:46:47 +0100  848) 
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  849)   describe("GET /productions/:productionId/tags", () => {
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  850)     it("should return 200 with flattened tags linked to the production", () => {
14842284 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:46:47 +0100  851)       return request(app.getHttpServer())
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  852)         .get("/productions/1/tags?lang=en")
14842284 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:46:47 +0100  853)         .expect(200)
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  854)         .expect([mockTagView]);
14842284 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:46:47 +0100  855)     });
14842284 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:46:47 +0100  856) 
14842284 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:46:47 +0100  857)     it("should call productionDb.getTagsOfProduction", async () => {
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100  858)       await request(app.getHttpServer()).get("/productions/1/tags?lang=en");
14842284 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:46:47 +0100  859)       expect(productionDb.getTagsOfProduction).toHaveBeenCalled();
14842284 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:46:47 +0100  860)     });
14842284 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:46:47 +0100  861) 
14842284 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:46:47 +0100  862)     it("should return 400 when productionId is not a number", () => {
14842284 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:46:47 +0100  863)       return request(app.getHttpServer())
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  864)         .get("/productions/abc/tags")
14842284 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:46:47 +0100  865)         .expect(400);
14842284 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:46:47 +0100  866)     });
14842284 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:46:47 +0100  867)   });
14842284 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:46:47 +0100  868) 
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  869)   describe("PUT /productions/:productionId/tags/:tagId", () => {
14842284 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:46:47 +0100  870)     it("should return 200 with the production after adding tag", () => {
14842284 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:46:47 +0100  871)       return request(app.getHttpServer())
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  872)         .put("/productions/1/tags/1")
14842284 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:46:47 +0100  873)         .expect(200)
14842284 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:46:47 +0100  874)         .expect(mockProduction);
14842284 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:46:47 +0100  875)     });
14842284 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:46:47 +0100  876) 
14842284 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:46:47 +0100  877)     it("should call productionDb.addTagToProduction with correct ids", async () => {
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  878)       await request(app.getHttpServer()).put("/productions/1/tags/2");
14842284 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:46:47 +0100  879)       expect(productionDb.addTagToProduction).toHaveBeenCalledWith(2, 1);
14842284 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:46:47 +0100  880)     });
14842284 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:46:47 +0100  881) 
14842284 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:46:47 +0100  882)     it("should return 400 when productionId is not a number", () => {
14842284 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:46:47 +0100  883)       return request(app.getHttpServer())
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  884)         .put("/productions/abc/tags/1")
14842284 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:46:47 +0100  885)         .expect(400);
14842284 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:46:47 +0100  886)     });
14842284 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:46:47 +0100  887) 
14842284 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:46:47 +0100  888)     it("should return 400 when tagId is not a number", () => {
14842284 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:46:47 +0100  889)       return request(app.getHttpServer())
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  890)         .put("/productions/1/tags/abc")
14842284 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:46:47 +0100  891)         .expect(400);
14842284 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:46:47 +0100  892)     });
14842284 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:46:47 +0100  893)   });
14842284 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:46:47 +0100  894) 
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  895)   describe("DELETE /productions/:productionId/tags/:tagId", () => {
14842284 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:46:47 +0100  896)     it("should return 200 with the production after removing tag", () => {
14842284 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:46:47 +0100  897)       return request(app.getHttpServer())
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  898)         .delete("/productions/1/tags/1")
14842284 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:46:47 +0100  899)         .expect(200)
14842284 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:46:47 +0100  900)         .expect(mockProduction);
14842284 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:46:47 +0100  901)     });
14842284 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:46:47 +0100  902) 
14842284 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:46:47 +0100  903)     it("should call productionDb.removeTagFromProduction with correct ids", async () => {
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  904)       await request(app.getHttpServer()).delete("/productions/1/tags/2");
14842284 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:46:47 +0100  905)       expect(productionDb.removeTagFromProduction).toHaveBeenCalledWith(2, 1);
14842284 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:46:47 +0100  906)     });
14842284 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:46:47 +0100  907) 
14842284 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:46:47 +0100  908)     it("should return 400 when productionId is not a number", () => {
14842284 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:46:47 +0100  909)       return request(app.getHttpServer())
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  910)         .delete("/productions/abc/tags/1")
14842284 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:46:47 +0100  911)         .expect(400);
14842284 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:46:47 +0100  912)     });
14842284 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:46:47 +0100  913)   });
14842284 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:46:47 +0100  914) });
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  915) 
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100  916) // ==========================================
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  917) // EVENT endpoints
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100  918) // ==========================================
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  919) 
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  920) describe("EventController (e2e)", () => {
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  921)   let app: INestApplication;
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  922)   let eventDb: EventDatabaseService;
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  923) 
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  924)   beforeEach(async () => {
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  925)     app = await buildApp();
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  926)     eventDb = app.get<EventDatabaseService>(EventDatabaseService);
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  927)   });
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  928) 
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  929)   afterEach(async () => {
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  930)     await app.close();
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  931)   });
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  932) 
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  933)   describe("GET /events", () => {
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  934)     it("should return 200 with an array of events", () => {
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  935)       return request(app.getHttpServer())
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  936)         .get("/events")
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  937)         .expect(200)
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  938)         .expect([mockEvent]);
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  939)     });
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  940) 
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  941)     it("should return 200 with empty array when no events exist", async () => {
3b0cb41f backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-21 21:38:18 +0100  942)       // @ts-ignore
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  943)       jest.spyOn(eventDb, "getEvents").mockResolvedValueOnce([]);
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  944)       return request(app.getHttpServer()).get("/events").expect(200).expect([]);
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  945)     });
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  946)   });
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  947) 
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  948)   describe("GET /events/:id", () => {
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  949)     it("should return 200 with the correct event", () => {
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  950)       return request(app.getHttpServer())
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  951)         .get("/events/1")
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  952)         .expect(200)
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  953)         .expect(mockEvent);
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  954)     });
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  955) 
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  956)     it("should call eventDb.getEventById with the correct id", async () => {
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  957)       await request(app.getHttpServer()).get("/events/1");
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  958)       expect(eventDb.getEventById).toHaveBeenCalledWith(1);
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  959)     });
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  960) 
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  961)     it("should return 400 when id is not a number", () => {
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  962)       return request(app.getHttpServer()).get("/events/abc").expect(400);
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  963)     });
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  964)   });
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  965) 
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  966)   describe("POST /events", () => {
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  967)     const createPayload = {
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  968)       starttime: "2025-06-01T19:00:00.000Z",
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  969)       endtime: "2025-06-01T22:00:00.000Z",
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  970)       production_id: 1,
58b28077 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-08 17:15:00 +0100  971)       doors_at: "2025-06-01T22:00:00.000Z",
58b28077 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-08 17:15:00 +0100  972)       intermission_at: "2025-06-01T22:00:00.000Z",
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  973)     };
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  974) 
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  975)     it("should return 201 with the created event", () => {
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  976)       return request(app.getHttpServer())
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  977)         .post("/events")
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  978)         .send(createPayload)
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  979)         .expect(201)
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  980)         .expect(mockEvent);
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  981)     });
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  982) 
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  983)     it("should call eventDb.createEvent with the payload", async () => {
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  984)       await request(app.getHttpServer()).post("/events").send(createPayload);
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  985)       expect(eventDb.createEvent).toHaveBeenCalledWith(createPayload);
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  986)     });
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  987)   });
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  988) 
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  989)   describe("PUT /events/:id", () => {
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  990)     it("should return 200 with the replaced event when ids match", () => {
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  991)       return request(app.getHttpServer())
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100  992)         .put("/events/1")
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  993)         .send(mockEvent)
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  994)         .expect(200)
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  995)         .expect(mockEvent);
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  996)     });
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  997) 
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  998)     it("should return 400 when id is not a number", () => {
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100  999)       return request(app.getHttpServer())
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100 1000)         .put("/events/abc")
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100 1001)         .send(mockEvent)
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100 1002)         .expect(400);
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100 1003)     });
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100 1004)   });
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100 1005) 
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100 1006)   describe("PATCH /events/:id", () => {
a908a988 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 12:32:40 +0100 1007)     it("should return 200 with the modified event", () => {
a908a988 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 12:32:40 +0100 1008)       return request(app.getHttpServer())
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100 1009)         .patch("/events/1")
2d8c9aa1 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-05 17:00:42 +0100 1010)         .send({ production_id: 2 })
a908a988 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 12:32:40 +0100 1011)         .expect(200)
a908a988 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 12:32:40 +0100 1012)         .expect(mockEvent);
a908a988 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 12:32:40 +0100 1013)     });
a908a988 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 12:32:40 +0100 1014) 
a908a988 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 12:32:40 +0100 1015)     it("should call eventDb.updateEvent", async () => {
a908a988 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 12:32:40 +0100 1016)       await request(app.getHttpServer())
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100 1017)         .patch("/events/1")
2d8c9aa1 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-05 17:00:42 +0100 1018)         .send({ production_id: 2 });
a908a988 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 12:32:40 +0100 1019)       expect(eventDb.updateEvent).toHaveBeenCalled();
a908a988 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 12:32:40 +0100 1020)     });
a908a988 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 12:32:40 +0100 1021) 
a908a988 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 12:32:40 +0100 1022)     it("should return 400 when id is not a number", () => {
a908a988 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 12:32:40 +0100 1023)       return request(app.getHttpServer())
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100 1024)         .patch("/events/abc")
2d8c9aa1 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-05 17:00:42 +0100 1025)         .send({ production_id: 2 })
a908a988 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 12:32:40 +0100 1026)         .expect(400);
a908a988 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 12:32:40 +0100 1027)     });
a908a988 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 12:32:40 +0100 1028)   });
a908a988 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 12:32:40 +0100 1029) 
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100 1030)   describe("DELETE /events/:id", () => {
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100 1031)     it("should return 200 when event is deleted", () => {
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100 1032)       return request(app.getHttpServer()).delete("/events/1").expect(200);
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100 1033)     });
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100 1034) 
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100 1035)     it("should call eventDb.deleteEvent with the correct id", async () => {
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100 1036)       await request(app.getHttpServer()).delete("/events/1");
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100 1037)       expect(eventDb.deleteEvent).toHaveBeenCalledWith(1);
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100 1038)     });
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100 1039) 
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100 1040)     it("should return 400 when id is not a number", () => {
fb5d491e backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 16:12:39 +0100 1041)       return request(app.getHttpServer()).delete("/events/abc").expect(400);
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100 1042)     });
7c19e545 backend/test/app.e2e-spec.ts      (Robin De Rudder  2026-02-28 10:51:53 +0100 1043)   });
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1044) });
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1045) 
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1046) // ==========================================
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1047) // LOCATION endpoints
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1048) // ==========================================
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1049) 
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1050) describe("LocationController (e2e)", () => {
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1051)   let app: INestApplication;
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1052)   let locationDb: LocationDatabaseService;
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1053) 
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1054)   beforeEach(async () => {
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1055)     app = await buildApp();
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1056)     locationDb = app.get<LocationDatabaseService>(LocationDatabaseService);
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1057)   });
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1058) 
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1059)   afterEach(async () => {
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1060)     await app.close();
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1061)   });
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1062) 
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1063)   describe("GET /locations", () => {
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100 1064)     it("should return 200 with an array of flattened locations", () => {
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1065)       return request(app.getHttpServer())
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100 1066)         .get("/locations?lang=en")
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1067)         .expect(200)
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100 1068)         .expect([mockLocationView]);
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1069)     });
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1070)   });
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1071) 
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1072)   describe("GET /locations/:locationId", () => {
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100 1073)     it("should return 200 with the correct flattened location", () => {
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1074)       return request(app.getHttpServer())
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100 1075)         .get("/locations/1?lang=en")
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1076)         .expect(200)
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100 1077)         .expect(mockLocationView);
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1078)     });
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1079) 
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1080)     it("should return 400 when locationId is not a number", () => {
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1081)       return request(app.getHttpServer()).get("/locations/abc").expect(400);
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1082)     });
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1083)   });
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1084) 
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1085)   describe("POST /locations", () => {
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1086)     it("should return 201 with the created location", () => {
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100 1087)       const createPayload = {
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100 1088)         location: { en: "Side Stage", nl: "Zijpodium" },
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100 1089)         legacy_id: "st",
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100 1090)       };
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1091)       return request(app.getHttpServer())
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1092)         .post("/locations")
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1093)         .send(createPayload)
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1094)         .expect(201)
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1095)         .expect(mockLocation);
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1096)     });
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1097)   });
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1098) 
669f78b2 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-17 11:30:03 +0100 1099)   describe("PATCH /locations/:locationId", () => {
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1100)     it("should return 200 with the updated location", () => {
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100 1101)       const updatePayload = {
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100 1102)         id: 1,
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100 1103)         location: { en: "Updated Stage", nl: "Bijgewerkt podium" },
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100 1104)       };
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1105)       return request(app.getHttpServer())
669f78b2 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-17 11:30:03 +0100 1106)         .patch("/locations/1")
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1107)         .send(updatePayload)
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1108)         .expect(200)
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1109)         .expect(mockLocation);
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1110)     });
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1111)   });
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1112) 
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1113)   describe("DELETE /locations/:locationId", () => {
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1114)     it("should return 200 after deleting location", () => {
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1115)       return request(app.getHttpServer()).delete("/locations/1").expect(200);
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1116)     });
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1117) 
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1118)     it("should return 400 when locationId is not a number", () => {
58b28077 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-08 17:15:00 +0100 1119)       return request(app.getHttpServer()).delete("/locations/abc").expect(400);
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1120)     });
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1121)   });
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1122) });
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1123) 
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1124) // ==========================================
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1125) // EVENT - LOCATION relationship endpoints
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1126) // ==========================================
a908a988 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 12:32:40 +0100 1127) 
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1128) describe("EventLocationController (e2e)", () => {
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1129)   let app: INestApplication;
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1130)   let eventDb: EventDatabaseService;
a908a988 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 12:32:40 +0100 1131) 
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1132)   beforeEach(async () => {
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1133)     app = await buildApp();
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1134)     eventDb = app.get<EventDatabaseService>(EventDatabaseService);
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1135)   });
a908a988 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 12:32:40 +0100 1136) 
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1137)   afterEach(async () => {
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1138)     await app.close();
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1139)   });
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1140) 
d592a8aa backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-17 11:04:21 +0100 1141)   describe("GET /events/:eventId/location", () => {
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100 1142)     it("should return 200 with the flattened location of the event", () => {
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1143)       return request(app.getHttpServer())
d592a8aa backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-17 11:04:21 +0100 1144)         .get("/events/1/location?lang=en")
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1145)         .expect(200)
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100 1146)         .expect(mockLocationView);
a908a988 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 12:32:40 +0100 1147)     });
a908a988 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 12:32:40 +0100 1148) 
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1149)     it("should call eventDb.getLocationOfEvent with the correct id", async () => {
d592a8aa backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-17 11:04:21 +0100 1150)       await request(app.getHttpServer()).get("/events/1/location?lang=en");
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1151)       expect(eventDb.getLocationOfEvent).toHaveBeenCalledWith(1);
a908a988 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 12:32:40 +0100 1152)     });
a908a988 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 12:32:40 +0100 1153) 
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1154)     it("should return 400 when eventId is not a number", () => {
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1155)       return request(app.getHttpServer())
d592a8aa backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-17 11:04:21 +0100 1156)         .get("/events/abc/location")
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1157)         .expect(400);
a908a988 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 12:32:40 +0100 1158)     });
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1159)   });
a908a988 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 12:32:40 +0100 1160) 
d592a8aa backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-17 11:04:21 +0100 1161)   describe("PUT /events/:eventId/location/:locationId", () => {
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1162)     it("should return 200 after successfully linking", () => {
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1163)       return request(app.getHttpServer())
d592a8aa backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-17 11:04:21 +0100 1164)         .put("/events/1/location/2")
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1165)         .expect(200);
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1166)     });
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1167) 
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1168)     it("should call eventDb.linkEventToLocation with correct ids", async () => {
d592a8aa backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-17 11:04:21 +0100 1169)       await request(app.getHttpServer()).put("/events/1/location/2");
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1170)       expect(eventDb.linkEventToLocation).toHaveBeenCalledWith(1, 2);
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1171)     });
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1172) 
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1173)     it("should return 400 when eventId is not a number", () => {
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1174)       return request(app.getHttpServer())
d592a8aa backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-17 11:04:21 +0100 1175)         .put("/events/abc/location/1")
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1176)         .expect(400);
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1177)     });
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1178) 
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1179)     it("should return 400 when locationId is not a number", () => {
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1180)       return request(app.getHttpServer())
d592a8aa backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-17 11:04:21 +0100 1181)         .put("/events/1/location/abc")
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1182)         .expect(400);
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1183)     });
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1184)   });
a908a988 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 12:32:40 +0100 1185) 
d592a8aa backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-17 11:04:21 +0100 1186)   describe("DELETE /events/:eventId/location", () => {
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1187)     it("should return 200 after unlinking", () => {
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1188)       return request(app.getHttpServer())
d592a8aa backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-17 11:04:21 +0100 1189)         .delete("/events/1/location")
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1190)         .expect(200);
a908a988 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 12:32:40 +0100 1191)     });
a908a988 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 12:32:40 +0100 1192) 
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1193)     it("should call eventDb.deleteLocationFromEvent with the eventId", async () => {
d592a8aa backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-17 11:04:21 +0100 1194)       await request(app.getHttpServer()).delete("/events/1/location");
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1195)       expect(eventDb.deleteLocationFromEvent).toHaveBeenCalledWith(1);
a908a988 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 12:32:40 +0100 1196)     });
a908a988 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 12:32:40 +0100 1197) 
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1198)     it("should return 400 when eventId is not a number", () => {
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1199)       return request(app.getHttpServer())
d592a8aa backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-17 11:04:21 +0100 1200)         .delete("/events/abc/location")
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1201)         .expect(400);
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1202)     });
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1203)   });
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1204) });
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1205) 
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1206) // ==========================================
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1207) // PRICE endpoints
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1208) // ==========================================
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1209) 
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1210) describe("PriceController (e2e)", () => {
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1211)   let app: INestApplication;
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1212)   let priceDb: PriceDatabaseService;
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1213) 
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1214)   beforeEach(async () => {
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1215)     app = await buildApp();
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1216)     priceDb = app.get<PriceDatabaseService>(PriceDatabaseService);
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1217)   });
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1218) 
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1219)   afterEach(async () => {
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1220)     await app.close();
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1221)   });
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1222) 
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1223)   describe("GET /prices", () => {
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100 1224)     it("should return 200 with an array of flattened prices", () => {
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1225)       return request(app.getHttpServer())
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100 1226)         .get("/prices?lang=en")
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1227)         .expect(200)
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100 1228)         .expect([mockPriceView]);
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1229)     });
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1230)   });
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1231) 
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1232)   describe("GET /prices/:priceId", () => {
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100 1233)     it("should return 200 with the correct flattened price", () => {
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1234)       return request(app.getHttpServer())
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100 1235)         .get("/prices/1?lang=en")
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1236)         .expect(200)
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100 1237)         .expect(mockPriceView);
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1238)     });
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1239) 
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1240)     it("should return 400 when priceId is not a number", () => {
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1241)       return request(app.getHttpServer()).get("/prices/abc").expect(400);
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1242)     });
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1243)   });
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1244) 
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1245)   describe("POST /prices", () => {
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1246)     it("should return 201 with the created price", () => {
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100 1247)       const createPayload = {
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100 1248)         price: 20.0,
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100 1249)         name: { en: "Standard", nl: "Standaard" },
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100 1250)         legacy_id: "",
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100 1251)       };
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1252)       return request(app.getHttpServer())
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1253)         .post("/prices")
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1254)         .send(createPayload)
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1255)         .expect(201)
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1256)         .expect(mockPrice);
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1257)     });
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1258)   });
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1259) 
9efbc32d backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-17 11:48:36 +0100 1260)   describe("PATCH /prices/:priceId", () => {
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1261)     it("should return 200 with the updated price", () => {
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100 1262)       const updatePayload = {
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100 1263)         id: 1,
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100 1264)         price: 25.0,
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100 1265)         name: { en: "Updated", nl: "Bijgewerkt" },
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100 1266)       };
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1267)       return request(app.getHttpServer())
9efbc32d backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-17 11:48:36 +0100 1268)         .patch("/prices/1")
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1269)         .send(updatePayload)
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1270)         .expect(200)
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1271)         .expect(mockPrice);
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1272)     });
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1273)   });
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1274) 
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1275)   describe("DELETE /prices/:priceId", () => {
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1276)     it("should return 200 after deleting price", () => {
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1277)       return request(app.getHttpServer()).delete("/prices/1").expect(200);
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1278)     });
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1279) 
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1280)     it("should call priceDb.deletePrice with correct id", async () => {
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1281)       await request(app.getHttpServer()).delete("/prices/1");
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1282)       expect(priceDb.deletePrice).toHaveBeenCalled();
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1283)     });
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1284)   });
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1285) });
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1286) 
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1287) // ==========================================
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1288) // EVENT - PRICE relationship endpoints
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1289) // ==========================================
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1290) 
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1291) describe("EventPriceController (e2e)", () => {
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1292)   let app: INestApplication;
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1293)   let eventDb: EventDatabaseService;
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1294) 
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1295)   beforeEach(async () => {
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1296)     app = await buildApp();
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1297)     eventDb = app.get<EventDatabaseService>(EventDatabaseService);
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1298)   });
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1299) 
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1300)   afterEach(async () => {
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1301)     await app.close();
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1302)   });
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1303) 
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1304)   describe("GET /events/:eventId/prices", () => {
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100 1305)     it("should return 200 with the flattened prices of the event", () => {
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1306)       return request(app.getHttpServer())
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100 1307)         .get("/events/1/prices?lang=en")
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1308)         .expect(200)
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100 1309)         .expect([mockPriceView]);
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1310)     });
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1311) 
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1312)     it("should call eventDb.getPricesOfEvent with the correct id", async () => {
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100 1313)       await request(app.getHttpServer()).get("/events/1/prices?lang=en");
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1314)       expect(eventDb.getPricesOfEvent).toHaveBeenCalledWith(1);
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1315)     });
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1316) 
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1317)     it("should return 400 when eventId is not a number", () => {
58b28077 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-08 17:15:00 +0100 1318)       return request(app.getHttpServer()).get("/events/abc/prices").expect(400);
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1319)     });
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1320)   });
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1321) 
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1322)   describe("PUT /events/:eventId/prices/:priceId", () => {
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1323)     it("should return 200 after successfully linking a price", () => {
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1324)       return request(app.getHttpServer())
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1325)         .put("/events/1/prices/100")
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1326)         .expect(200)
f0ccf555 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-10 15:07:55 +0100 1327)         .expect("true");
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1328)     });
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1329) 
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1330)     it("should call eventDb.addPriceToEvent with correct ids", async () => {
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1331)       await request(app.getHttpServer()).put("/events/1/prices/100");
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1332)       expect(eventDb.addPriceToEvent).toHaveBeenCalledWith(1, 100);
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1333)     });
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1334) 
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1335)     it("should return 400 when eventId is not a number", () => {
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1336)       return request(app.getHttpServer())
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1337)         .put("/events/abc/prices/100")
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1338)         .expect(400);
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1339)     });
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1340) 
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1341)     it("should return 400 when priceId is not a number", () => {
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1342)       return request(app.getHttpServer())
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1343)         .put("/events/1/prices/abc")
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1344)         .expect(400);
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1345)     });
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1346)   });
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1347) 
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1348)   describe("DELETE /events/:eventId/prices/:priceId", () => {
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1349)     it("should return 200 after unlinking a price", () => {
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1350)       return request(app.getHttpServer())
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1351)         .delete("/events/1/prices/100")
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1352)         .expect(200);
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1353)     });
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1354) 
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1355)     it("should call eventDb.removePriceFromEvent with correct ids", async () => {
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1356)       await request(app.getHttpServer()).delete("/events/1/prices/100");
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1357)       expect(eventDb.removePriceFromEvent).toHaveBeenCalledWith(1, 100);
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1358)     });
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1359) 
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1360)     it("should return 400 when eventId is not a number", () => {
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1361)       return request(app.getHttpServer())
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1362)         .delete("/events/abc/prices/100")
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1363)         .expect(400);
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1364)     });
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1365) 
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1366)     it("should return 400 when priceId is not a number", () => {
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1367)       return request(app.getHttpServer())
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1368)         .delete("/events/1/prices/abc")
844d285c backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-07 00:20:32 +0100 1369)         .expect(400);
a908a988 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 12:32:40 +0100 1370)     });
a908a988 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-03 12:32:40 +0100 1371)   });
ac46e516 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-02 13:35:41 +0100 1372) });
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1373) 
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1374) // ==========================================
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1375) // MEDIA CROP endpoints
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1376) // ==========================================
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1377) 
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1378) describe("MediaCropController (e2e)", () => {
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1379)   let app: INestApplication;
4c574244 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-31 14:25:45 +0200 1380)   let mediaDb: MediaCropDatabaseService; // Using any or MediaDatabaseService type if imported
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1381) 
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1382)   beforeEach(async () => {
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1383)     app = await buildApp();
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1384)     // Adjust token if needed based on how it's exported
4c574244 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-31 14:25:45 +0200 1385)     mediaDb = app.get<MediaCropDatabaseService>(MediaCropDatabaseService);
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1386)   });
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1387) 
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1388)   afterEach(async () => {
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1389)     await app.close();
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1390)   });
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1391) 
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1392)   describe("GET /crops", () => {
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1393)     it("should return 200 with a paginated list of crops", () => {
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1394)       return request(app.getHttpServer())
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1395)         .get("/crops?page=1&limit=10")
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1396)         .expect(200)
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1397)         .expect(paginatedResponse([mockMediaCrop]));
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1398)     });
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1399)   });
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1400) 
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1401)   describe("GET /crops/:cropId", () => {
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1402)     it("should return 200 with the correct crop", () => {
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1403)       return request(app.getHttpServer())
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1404)         .get("/crops/1")
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1405)         .expect(200)
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1406)         .expect(mockMediaCrop);
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1407)     });
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1408)   });
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1409) 
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1410)   describe("POST /crops", () => {
06a70715 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-30 16:55:57 +0200 1411)     it("should return 201 with the created crop", async () => {
06a70715 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-30 16:55:57 +0200 1412)       const response = await request(app.getHttpServer()).post("/crops").send({
06a70715 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-30 16:55:57 +0200 1413)         item_id: 1,
06a70715 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-30 16:55:57 +0200 1414)         name: "hd_ready",
06a70715 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-30 16:55:57 +0200 1415)         url: "https://test.com/a.jpg",
06a70715 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-30 16:55:57 +0200 1416)         autoDownload: 0,
06a70715 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-30 16:55:57 +0200 1417)       });
06a70715 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-30 16:55:57 +0200 1418) 
06a70715 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-30 16:55:57 +0200 1419)       // THIS WILL TELL YOU EXACTLY WHAT IS WRONG:
06a70715 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-30 16:55:57 +0200 1420)       if (response.status === 400) {
06a70715 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-30 16:55:57 +0200 1421)         console.log("Validation Error:", response.body);
06a70715 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-30 16:55:57 +0200 1422)       }
06a70715 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-30 16:55:57 +0200 1423) 
06a70715 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-30 16:55:57 +0200 1424)       expect(response.status).toBe(201);
06a70715 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-30 16:55:57 +0200 1425)       expect(response.body).toEqual(mockMediaCrop);
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1426)     });
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1427)   });
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1428) 
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1429)   describe("PUT /crops/:cropId", () => {
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1430)     it("should return 200 with the replaced crop", () => {
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1431)       return request(app.getHttpServer())
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1432)         .put("/crops/1")
ab8e4739 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-30 22:22:21 +0200 1433)         .send({ name: "hd_ready", url: "https://test.com/b.jpg" })
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1434)         .expect(200)
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1435)         .expect(mockMediaCrop);
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1436)     });
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1437)   });
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1438) 
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1439)   describe("PATCH /crops/:cropId", () => {
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1440)     it("should return 200 with the modified crop", () => {
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1441)       return request(app.getHttpServer())
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1442)         .patch("/crops/1")
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1443)         .send({ url: "https://test.com/new.jpg" })
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1444)         .expect(200)
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1445)         .expect(mockMediaCrop);
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1446)     });
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1447)   });
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1448) 
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1449)   describe("DELETE /crops/:cropId", () => {
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1450)     it("should return 200 after deleting crop", () => {
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1451)       return request(app.getHttpServer()).delete("/crops/1").expect(200);
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1452)     });
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1453)   });
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1454) });
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1455) 
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1456) // ==========================================
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1457) // MEDIA ITEM endpoints
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1458) // ==========================================
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1459) 
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1460) describe("MediaItemController (e2e)", () => {
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1461)   let app: INestApplication;
4c574244 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-31 14:25:45 +0200 1462)   let mediaDb: MediaItemDatabaseService;
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1463) 
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1464)   beforeEach(async () => {
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1465)     app = await buildApp();
4c574244 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-31 14:25:45 +0200 1466)     mediaDb = app.get<MediaItemDatabaseService>(MediaItemDatabaseService);
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1467)   });
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1468) 
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1469)   afterEach(async () => {
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1470)     await app.close();
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1471)   });
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1472) 
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1473)   describe("GET /items", () => {
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1474)     it("should return 200 with a paginated list of flattened items", () => {
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1475)       return request(app.getHttpServer())
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1476)         .get("/items?lang=en")
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1477)         .expect(200)
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1478)         .expect(paginatedResponse([mockMediaItemView]));
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1479)     });
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1480)   });
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1481) 
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1482)   describe("GET /items/:itemId", () => {
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1483)     it("should return 200 with the correct flattened item", () => {
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1484)       return request(app.getHttpServer())
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1485)         .get("/items/1?lang=en")
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1486)         .expect(200)
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1487)         .expect(mockMediaItemView);
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1488)     });
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1489)   });
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1490) 
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1491)   describe("POST /items", () => {
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1492)     it("should return 201 with the created item", () => {
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1493)       return request(app.getHttpServer())
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1494)         .post("/items")
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1495)         .send({
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1496)           type: "image",
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1497)           original_filename: "test.png",
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1498)           position: "main",
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1499)           width: 1920,
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1500)           height: 1080,
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1501)           title: { en: "Test Media", nl: "Test Media" },
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1502)           description: { en: "Desc", nl: "Beschrijving" },
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1503)           credits: { en: "Credits", nl: "Credits" },
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1504)         })
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1505)         .expect(201)
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1506)         .expect(mockMediaItem);
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1507)     });
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1508)   });
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1509) 
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1510)   describe("PUT /items/:itemId", () => {
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1511)     it("should return 200 with the replaced item", () => {
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1512)       return request(app.getHttpServer())
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1513)         .put("/items/1")
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1514)         .send({
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1515)           type: "image",
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1516)           original_filename: "test.png",
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1517)           position: "main",
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1518)           width: 1920,
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1519)           height: 1080,
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1520)           title: { en: "Test Media", nl: "Test Media" },
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1521)           description: { en: "Desc", nl: "Beschrijving" },
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1522)           credits: { en: "Credits", nl: "Credits" },
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1523)         })
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1524)         .expect(200)
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1525)         .expect(mockMediaItem);
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1526)     });
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1527)   });
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1528) 
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1529)   describe("PATCH /items/:itemId", () => {
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1530)     it("should return 200 with the modified item", () => {
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1531)       return request(app.getHttpServer())
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1532)         .patch("/items/1")
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1533)         .send({ position: "carousel" })
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1534)         .expect(200)
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1535)         .expect(mockMediaItem);
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1536)     });
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1537)   });
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1538) 
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1539)   describe("DELETE /items/:itemId", () => {
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1540)     it("should return 200 after deleting item", () => {
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1541)       return request(app.getHttpServer()).delete("/items/1").expect(200);
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1542)     });
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1543)   });
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1544) 
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1545)   // Relationships: Item <-> Crops
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1546)   describe("GET /items/:itemId/crops", () => {
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1547)     it("should return 200 with the crops of the item", () => {
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1548)       return request(app.getHttpServer())
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1549)         .get("/items/1/crops")
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1550)         .expect(200)
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1551)         .expect([mockMediaCrop]);
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1552)     });
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1553)   });
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1554) 
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1555)   describe("PUT /items/:itemId/crops/:cropId", () => {
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1556)     it("should return 200 after successfully linking crop", () => {
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1557)       return request(app.getHttpServer()).put("/items/1/crops/2").expect(200);
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1558)     });
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1559)   });
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1560) 
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1561)   describe("DELETE /items/:itemId/crops/:cropId", () => {
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1562)     it("should return 200 after unlinking crop", () => {
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1563)       return request(app.getHttpServer())
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1564)         .delete("/items/1/crops/2")
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1565)         .expect(200);
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1566)     });
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1567)   });
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1568) });
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1569) 
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1570) // ==========================================
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1571) // MEDIA GALLERY endpoints
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1572) // ==========================================
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1573) 
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1574) describe("MediaGalleryController (e2e)", () => {
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1575)   let app: INestApplication;
4c574244 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-31 14:25:45 +0200 1576)   let mediaDb: MediaGalleryDatabaseService;
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1577) 
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1578)   beforeEach(async () => {
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1579)     app = await buildApp();
4c574244 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-31 14:25:45 +0200 1580)     mediaDb = app.get<MediaGalleryDatabaseService>(MediaGalleryDatabaseService);
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1581)   });
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1582) 
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1583)   afterEach(async () => {
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1584)     await app.close();
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1585)   });
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1586) 
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1587)   describe("GET /galleries", () => {
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1588)     it("should return 200 with a paginated list of galleries", () => {
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1589)       return request(app.getHttpServer())
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1590)         .get("/galleries?page=1&limit=10")
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1591)         .expect(200)
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1592)         .expect(paginatedResponse([mockMediaGallery]));
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1593)     });
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1594)   });
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1595) 
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1596)   describe("GET /galleries/:galleryId", () => {
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1597)     it("should return 200 with the correct gallery", () => {
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1598)       return request(app.getHttpServer())
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1599)         .get("/galleries/1")
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1600)         .expect(200)
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1601)         .expect(mockMediaGallery);
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1602)     });
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1603)   });
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1604) 
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1605)   describe("POST /galleries", () => {
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1606)     it("should return 201 with the created gallery", () => {
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1607)       return request(app.getHttpServer())
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1608)         .post("/galleries")
4c574244 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-31 14:25:45 +0200 1609)         .send({ name: "hi", type: "default" })
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1610)         .expect(201)
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1611)         .expect(mockMediaGallery);
4c574244 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-31 14:25:45 +0200 1612)     });
4c574244 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-31 14:25:45 +0200 1613)   });
4c574244 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-31 14:25:45 +0200 1614) 
4c574244 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-31 14:25:45 +0200 1615)   describe("PUT /galleries/:galleryId", () => {
4c574244 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-31 14:25:45 +0200 1616)     it("should return 200 with the replaced gallery", () => {
4c574244 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-31 14:25:45 +0200 1617)       return request(app.getHttpServer())
4c574244 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-31 14:25:45 +0200 1618)         .put("/galleries/1")
4c574244 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-31 14:25:45 +0200 1619)         .send({ name: "completely replaced gallery", type: "default" })
4c574244 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-31 14:25:45 +0200 1620)         .expect(200)
4c574244 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-31 14:25:45 +0200 1621)         .expect(mockMediaGallery);
4c574244 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-31 14:25:45 +0200 1622)     });
4c574244 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-31 14:25:45 +0200 1623)   });
4c574244 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-31 14:25:45 +0200 1624) 
4c574244 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-31 14:25:45 +0200 1625)   describe("PATCH /galleries/:galleryId", () => {
4c574244 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-31 14:25:45 +0200 1626)     it("should return 200 with the modified gallery", () => {
4c574244 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-31 14:25:45 +0200 1627)       return request(app.getHttpServer())
4c574244 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-31 14:25:45 +0200 1628)         .patch("/galleries/1")
4c574244 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-31 14:25:45 +0200 1629)         .send({ name: "just updated the name" })
4c574244 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-31 14:25:45 +0200 1630)         .expect(200)
4c574244 backend/test/app.e2e-spec.ts      (Sebastien Harris 2026-03-31 14:25:45 +0200 1631)         .expect(mockMediaGallery);
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1632)     });
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1633)   });
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1634) 
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1635)   describe("DELETE /galleries/:galleryId", () => {
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1636)     it("should return 200 after deleting gallery", () => {
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1637)       return request(app.getHttpServer()).delete("/galleries/1").expect(200);
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1638)     });
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1639)   });
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1640) 
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1641)   // Relationships: Gallery <-> Items
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1642)   describe("GET /galleries/:galleryId/items", () => {
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1643)     it("should return 200 with items of the gallery", () => {
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1644)       return request(app.getHttpServer())
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1645)         .get("/galleries/1/items")
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1646)         .expect(200)
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1647)         .expect([mockMediaItem]);
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1648)     });
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1649)   });
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1650) 
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1651)   describe("PUT /galleries/:galleryId/items/:itemId", () => {
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1652)     it("should return 200 after linking item to gallery", () => {
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1653)       return request(app.getHttpServer())
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1654)         .put("/galleries/1/items/2")
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1655)         .expect(200);
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1656)     });
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1657)   });
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1658) 
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1659)   describe("DELETE /galleries/:galleryId/items/:itemId", () => {
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1660)     it("should return 200 after unlinking item from gallery", () => {
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1661)       return request(app.getHttpServer())
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1662)         .delete("/galleries/1/items/2")
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1663)         .expect(200);
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1664)     });
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1665)   });
000d5aa1 backend/test/app.e2e-spec.ts      (Alexander Nollet 2026-03-28 15:47:36 +0100 1666) });
