import { Test, TestingModule } from "@nestjs/testing";
import { MediaStorageService } from "./service/media_storage.service";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import * as fs from "fs";
import { ConfigService } from "@nestjs/config";

jest.mock("fs");

describe("MediaStorageService", () => {
  let service: MediaStorageService;
  let configService: ConfigService;

  const mockUrl = "http://127.0.0.1/photos/image.png";
  const mockBuffer = Buffer.from("mock-image-data");

  // 1. Create the mock config service
  const mockConfigService = {
    get: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("LocalMediaStorage (development)", () => {
    beforeEach(async () => {
      // 2. Set the mock to return "development" for this suite
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === "NODE_ENV") return "development";
        return null;
      });

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          MediaStorageService,
          // 3. Provide the mock ConfigService
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
        ],
      }).compile();

      service = module.get<MediaStorageService>(MediaStorageService);
      configService = module.get<ConfigService>(ConfigService);
    });

    describe("saveMedia", () => {
      it("should write file to disk and return the URL", async () => {
        (fs.mkdirSync as jest.Mock).mockReturnValue(undefined);
        (fs.writeFileSync as jest.Mock).mockReturnValue(undefined);

        const result = await service.saveMedia(mockUrl, mockBuffer);

        expect(fs.mkdirSync).toHaveBeenCalledWith(expect.any(String), {
          recursive: true,
        });
        expect(fs.writeFileSync).toHaveBeenCalledWith(
          expect.any(String),
          mockBuffer,
        );
        expect(result).toEqual(mockUrl);
      });
    });

    describe("getMedia", () => {
      it("should return a buffer when the file exists", async () => {
        (fs.existsSync as jest.Mock).mockReturnValue(true);
        (fs.readFileSync as jest.Mock).mockReturnValue(mockBuffer);

        const result = await service.getMedia(mockUrl);

        expect(fs.existsSync).toHaveBeenCalledWith(expect.any(String));
        expect(fs.readFileSync).toHaveBeenCalledWith(expect.any(String));
        expect(result).toEqual(mockBuffer);
      });

      it("should throw NotFoundException when file does not exist", async () => {
        (fs.existsSync as jest.Mock).mockReturnValue(false);

        await expect(service.getMedia(mockUrl)).rejects.toThrow(
          NotFoundException,
        );
      });
    });

    describe("deleteMedia", () => {
      it("should delete the file when it exists", async () => {
        (fs.existsSync as jest.Mock).mockReturnValue(true);
        (fs.unlinkSync as jest.Mock).mockReturnValue(undefined);

        await service.deleteMedia(mockUrl);

        expect(fs.existsSync).toHaveBeenCalledWith(expect.any(String));
        expect(fs.unlinkSync).toHaveBeenCalledWith(expect.any(String));
      });

      it("should throw NotFoundException when file does not exist", async () => {
        (fs.existsSync as jest.Mock).mockReturnValue(false);

        await expect(service.deleteMedia(mockUrl)).rejects.toThrow(
          NotFoundException,
        );
      });
    });
  });

  describe("RemoteMediaStorage (production)", () => {
    beforeEach(async () => {
      // 4. Set the mock to return "production" for this suite
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === "NODE_ENV") return "production";
        return null;
      });

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          MediaStorageService,
          {
            provide: ConfigService,
            useValue: mockConfigService,
          },
        ],
      }).compile();

      service = module.get<MediaStorageService>(MediaStorageService);
      configService = module.get<ConfigService>(ConfigService);
    });

    describe("saveMedia", () => {
      it("should PUT the buffer to the URL and return it", async () => {
        global.fetch = jest.fn().mockResolvedValue({ ok: true });

        const result = await service.saveMedia(mockUrl, mockBuffer);

        expect(fetch).toHaveBeenCalledWith(mockUrl, {
          method: "PUT",
          body: mockBuffer.buffer,
        });
        expect(result).toEqual(mockUrl);
      });

      it("should throw BadRequestException when the response is not ok", async () => {
        global.fetch = jest
          .fn()
          .mockResolvedValue({ ok: false, statusText: "Bad Request" });

        await expect(service.saveMedia(mockUrl, mockBuffer)).rejects.toThrow(
          BadRequestException,
        );
      });
    });

    describe("getMedia", () => {
      it("should return a buffer from the remote URL", async () => {
        const arrayBuffer = mockBuffer.buffer.slice(
          mockBuffer.byteOffset,
          mockBuffer.byteOffset + mockBuffer.byteLength,
        );
        global.fetch = jest.fn().mockResolvedValue({
          ok: true,
          status: 200,
          arrayBuffer: jest.fn().mockResolvedValue(arrayBuffer),
        });

        const result = await service.getMedia(mockUrl);

        expect(fetch).toHaveBeenCalledWith(mockUrl);
        expect(result).toEqual(mockBuffer);
      });

      it("should throw NotFoundException on 404", async () => {
        global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 404 });

        await expect(service.getMedia(mockUrl)).rejects.toThrow(
          NotFoundException,
        );
      });

      it("should throw BadRequestException on other non-ok responses", async () => {
        global.fetch = jest.fn().mockResolvedValue({
          ok: false,
          status: 500,
          statusText: "Server Error",
        });

        await expect(service.getMedia(mockUrl)).rejects.toThrow(
          BadRequestException,
        );
      });
    });

    describe("deleteMedia", () => {
      it("should DELETE the media at the given URL", async () => {
        global.fetch = jest.fn().mockResolvedValue({ ok: true });

        await service.deleteMedia(mockUrl);

        expect(fetch).toHaveBeenCalledWith(mockUrl, { method: "DELETE" });
      });

      it("should throw an error when the response is not ok", async () => {
        global.fetch = jest
          .fn()
          .mockResolvedValue({ ok: false, statusText: "Not Found" });

        await expect(service.deleteMedia(mockUrl)).rejects.toThrow(Error);
      });
    });
  });
});
