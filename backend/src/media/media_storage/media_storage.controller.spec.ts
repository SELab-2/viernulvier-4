import { Test, TestingModule } from "@nestjs/testing";
import { MediaStorageController } from "./media_storage.controller";
import { MediaStorageService } from "./media_storage.service";
import { ApiKeyGuard } from "../../auth/authGuard";
import { Readable } from "stream";

describe("MediaStorageController", () => {
  let controller: MediaStorageController;
  let service: MediaStorageService;

  const mockUrl = "https://example.com/media/image.png";
  const mockBuffer = Buffer.from("mock-image-data");
  const mockFile: Express.Multer.File = {
    buffer: mockBuffer,
    fieldname: "file",
    originalname: "image.png",
    encoding: "7bit",
    mimetype: "image/png",
    size: mockBuffer.length,
    stream: new Readable(),
    destination: "",
    filename: "",
    path: "",
  };

  const mockMediaStorageService = {
    getMedia: jest.fn().mockResolvedValue(mockBuffer),
    saveMedia: jest.fn().mockResolvedValue(mockUrl),
    deleteMedia: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MediaStorageController],
      providers: [
        {
          provide: MediaStorageService,
          useValue: mockMediaStorageService,
        },
      ],
    })
      .overrideGuard(ApiKeyGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<MediaStorageController>(MediaStorageController);
    service = module.get<MediaStorageService>(MediaStorageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("saveMedia", () => {
    it("should save media and return the URL", async () => {
      const result = await controller.saveMedia(mockUrl, mockFile);

      expect(result).toEqual(mockUrl);
      expect(service.saveMedia).toHaveBeenCalledWith(mockUrl, mockBuffer);
      expect(service.saveMedia).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteMedia", () => {
    it("should delete media at the given URL", async () => {
      const result = await controller.deleteMedia(mockUrl);

      expect(result).toBeUndefined();
      expect(service.deleteMedia).toHaveBeenCalledWith(mockUrl);
      expect(service.deleteMedia).toHaveBeenCalledTimes(1);
    });
  });
});
