import { Test, TestingModule } from "@nestjs/testing";
import { MediaStorageService } from "./service/media_storage.service";
import { NotFoundException } from "@nestjs/common";
import * as fs from "fs";
import { ConfigService } from "@nestjs/config";

jest.mock("fs");

describe("MediaStorageService", () => {
  let service: MediaStorageService;

  const mockUrl = "http://127.0.0.1/photos/image.png";
  const mockBuffer = Buffer.from("mock-image-data");

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks(); // Safely clean up fetch spies
  });

  // ==========================================
  // LOCAL STORAGE SUITE (DEVELOPMENT)
  // ==========================================
  describe("LocalMediaStorage (development)", () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          MediaStorageService,
          {
            provide: ConfigService,
            // INLINE MOCK: 100% guaranteed to return 'development' for this suite
            useValue: {
              get: jest.fn().mockReturnValue("development"),
            },
          },
        ],
      }).compile();

      service = module.get<MediaStorageService>(MediaStorageService);
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
});
