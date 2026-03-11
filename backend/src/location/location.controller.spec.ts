import { Test, TestingModule } from "@nestjs/testing";
import { LocationController } from "./location.controller";
import { LocationService } from "./location.service";
import { LanguageService } from "../util/language/language.service";
import {
  CreateLocationDto,
  LocationDto,
  LocationViewDto,
  UpdateLocationDto,
  LanguageQueryDto,
} from "../dto/dto";
import { ApiKeyGuard } from "../auth/authGuard";

describe("LocationController", () => {
  let controller: LocationController;
  let service: LocationService;
  let languageService: LanguageService;

  // Updated Mock data to match localized LocationSchema
  const mockLocation: LocationDto = {
    id: 1,
    location: {
      en: "Citadel Park",
      nl: "Citadelpark",
    },
    created_at: "2025-06-01T22:00:00.000Z",
    updated_at: "2025-06-01T22:00:00.000Z",
    legacy_id: "str",
  };

  // What the LanguageService returns after flattening
  const mockLocationView: LocationViewDto = {
    id: 1,
    location: "Citadel Park",
    created_at: "2025-06-01T22:00:00.000Z",
    updated_at: "2025-06-01T22:00:00.000Z",
    legacy_id: "str",
  };

  const mockLocationArray: LocationDto[] = [mockLocation];
  const mockLocationViewArray: LocationViewDto[] = [mockLocationView];

  // Mocking the LocationService
  const mockLocationService = {
    getLocations: jest.fn().mockResolvedValue(mockLocationArray),
    getLocationById: jest.fn().mockResolvedValue(mockLocation),
    createLocation: jest.fn().mockResolvedValue(mockLocation),
    updateLocation: jest.fn().mockResolvedValue(mockLocation),
    deleteLocation: jest.fn().mockResolvedValue(undefined),
  };

  // Mocking the LanguageService
  const mockLanguageService = {
    flattenByLanguage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocationController],
      providers: [
        {
          provide: LocationService,
          useValue: mockLocationService,
        },
        {
          provide: LanguageService,
          useValue: mockLanguageService,
        },
      ],
    })
      .overrideGuard(ApiKeyGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<LocationController>(LocationController);
    service = module.get<LocationService>(LocationService);
    languageService = module.get<LanguageService>(LanguageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getLocations", () => {
    it("should return an array of locations flattened by language", async () => {
      const langQuery: LanguageQueryDto = { lang: "en" };

      mockLocationService.getLocations.mockResolvedValue(mockLocationArray);
      mockLanguageService.flattenByLanguage.mockReturnValue(
        mockLocationViewArray,
      );

      const result = await controller.getLocations(langQuery);

      expect(result).toEqual(mockLocationViewArray);
      expect(service.getLocations).toHaveBeenCalledTimes(1);
      expect(languageService.flattenByLanguage).toHaveBeenCalledWith(
        mockLocationArray,
        langQuery.lang,
      );
    });
  });

  describe("getLocationById", () => {
    it("should return a single location by ID flattened by language", async () => {
      const langQuery: LanguageQueryDto = { lang: "en" };

      mockLocationService.getLocationById.mockResolvedValue(mockLocation);
      mockLanguageService.flattenByLanguage.mockReturnValue(mockLocationView);

      const result = await controller.getLocationById(1, langQuery);

      expect(result).toEqual(mockLocationView);
      expect(service.getLocationById).toHaveBeenCalledWith(1);
      expect(languageService.flattenByLanguage).toHaveBeenCalledWith(
        mockLocation,
        langQuery.lang,
      );
    });
  });

  describe("createLocation", () => {
    it("should create and return a new location", async () => {
      const dto: CreateLocationDto = {
        location: { en: "Citadel Park", nl: "Citadelpark" },
        legacy_id: null,
      };
      const result = await controller.createLocation(dto);

      expect(result).toEqual(mockLocation);
      expect(service.createLocation).toHaveBeenCalledWith(dto);
    });
  });

  describe("updateLocation", () => {
    it("should update and return the location", async () => {
      const dto: UpdateLocationDto = {
        id: 1,
        location: { en: "Updated Park", nl: "Bijgewerkt park" },
      };
      const result = await controller.updateLocation(dto);

      expect(result).toEqual(mockLocation);
      expect(service.updateLocation).toHaveBeenCalledWith(dto);
    });
  });

  describe("deleteLocation", () => {
    it("should delete the location successfully", async () => {
      const result = await controller.deleteLocation(1);

      expect(result).toBeUndefined();
      expect(service.deleteLocation).toHaveBeenCalledWith(1);
    });
  });
});
