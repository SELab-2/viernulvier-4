import { Test, TestingModule } from "@nestjs/testing";
import { LocationService } from "./location.service";
import { LocationDatabaseService } from "../database/db.location.service";
import { CreateLocationDto, LocationDto, UpdateLocationDto } from "../dto/dto";

describe("LocationService", () => {
  let service: LocationService;
  let dbService: LocationDatabaseService;

  // Updated Mock data to match LocationSchema
  const mockLocation: LocationDto = {
    id: 1,
    location: "Citadel Park",
    created_at: "2025-06-01T22:00:00.000Z",
    updated_at: "2025-06-01T22:00:00.000Z",
    legacy_id: "str",
  };

  const mockLocationArray: LocationDto[] = [mockLocation];

  // Mocking the LocationDatabaseService
  const mockLocationDatabaseService = {
    getLocations: jest.fn().mockResolvedValue(mockLocationArray),
    getLocationById: jest.fn().mockResolvedValue(mockLocation),
    createLocation: jest.fn().mockResolvedValue(mockLocation),
    updateLocation: jest.fn().mockResolvedValue(mockLocation),
    deleteLocation: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationService,
        {
          provide: LocationDatabaseService,
          useValue: mockLocationDatabaseService,
        },
      ],
    }).compile();

    service = module.get<LocationService>(LocationService);
    dbService = module.get<LocationDatabaseService>(LocationDatabaseService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getLocations", () => {
    it("should fetch all locations from the database", async () => {
      const result = await service.getLocations();
      expect(result).toEqual(mockLocationArray);
      expect(dbService.getLocations).toHaveBeenCalledTimes(1);
    });
  });

  describe("getLocationById", () => {
    it("should fetch a specific location by ID from the database", async () => {
      const result = await service.getLocationById(1);
      expect(result).toEqual(mockLocation);
      expect(dbService.getLocationById).toHaveBeenCalledWith(1);
    });
  });

  describe("createLocation", () => {
    it("should create a location in the database", async () => {
      const dto = { location: "Citadel Park" } as CreateLocationDto;
      const result = await service.createLocation(dto);
      expect(result).toEqual(mockLocation);
      expect(dbService.createLocation).toHaveBeenCalledWith(dto);
    });
  });

  describe("updateLocation", () => {
    it("should update a location in the database", async () => {
      const dto = { id: 1, location: "Updated Park" } as UpdateLocationDto;
      const result = await service.updateLocation(dto);
      expect(result).toEqual(mockLocation);
      expect(dbService.updateLocation).toHaveBeenCalledWith(dto);
    });
  });

  describe("deleteLocation", () => {
    it("should delete a location in the database", async () => {
      const result = await service.deleteLocation(1);
      expect(result).toBeUndefined();
      expect(dbService.deleteLocation).toHaveBeenCalledWith(1);
    });
  });
});
