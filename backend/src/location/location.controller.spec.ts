import { Test, TestingModule } from "@nestjs/testing";
import { LocationController } from "./location.controller";
import { LocationService } from "./location.service";
import { CreateLocationDto, LocationDto, UpdateLocationDto } from "../dto/dto";
import { ApiKeyGuard } from "../auth/authGuard";

describe("LocationController", () => {
  let controller: LocationController;
  let service: LocationService;

  // Updated Mock data to match LocationSchema
  const mockLocation: LocationDto = {
    id: 1,
    location: "Citadel Park",
    created_at: "2025-06-01T22:00:00.000Z",
    updated_at: "2025-06-01T22:00:00.000Z",
    legacy_id: "str",
  };

  const mockLocationArray: LocationDto[] = [mockLocation];

  // Mocking the LocationService
  const mockLocationService = {
    getLocations: jest.fn().mockResolvedValue(mockLocationArray),
    getLocationById: jest.fn().mockResolvedValue(mockLocation),
    createLocation: jest.fn().mockResolvedValue(mockLocation),
    updateLocation: jest.fn().mockResolvedValue(mockLocation),
    deleteLocation: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocationController],
      providers: [
        {
          provide: LocationService,
          useValue: mockLocationService,
        },
      ],
    })
      .overrideGuard(ApiKeyGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<LocationController>(LocationController);
    service = module.get<LocationService>(LocationService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getLocations", () => {
    it("should return an array of locations", async () => {
      const result = await controller.getLocations();
      expect(result).toEqual(mockLocationArray);
      expect(service.getLocations).toHaveBeenCalledTimes(1);
    });
  });

  describe("getLocationById", () => {
    it("should return a single location by ID", async () => {
      const result = await controller.getLocationById(1);
      expect(result).toEqual(mockLocation);
      expect(service.getLocationById).toHaveBeenCalledWith(1);
    });
  });

  describe("createLocation", () => {
    it("should create and return a new location", async () => {
      const dto = { location: "Citadel Park" } as CreateLocationDto;
      const result = await controller.createLocation(dto);
      expect(result).toEqual(mockLocation);
      expect(service.createLocation).toHaveBeenCalledWith(dto);
    });
  });

  describe("updateLocation", () => {
    it("should update and return the location", async () => {
      const dto = { id: 1, location: "Updated Park" } as UpdateLocationDto;
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
