import { Test, TestingModule } from "@nestjs/testing";
import { LocationService } from "./location.service";
import { LocationDatabaseService } from "../database/db.location.service";
import {
  CreateLocationDto,
  LocationDto,
  PaginationFilterDto,
  ModifyLocationDto,
} from "../dto/dto";

describe("LocationService", () => {
  let service: LocationService;
  let dbService: LocationDatabaseService;

  // Updated Mock data to match localized LocationSchema
  const mockLocation: LocationDto = {
    id: 1,
    location: {
      en: "Citadel Park",
      nl: "Citadelpark",
    },
    created_at: "2025-06-01T22:00:00.000Z",
    updated_at: "2025-06-01T22:00:00.000Z",
  };

  const filter: PaginationFilterDto = {
    limit: 10,
    page: 1,
    descending: false,
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
      const result = await service.getLocations(filter, {});
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
      const dto: CreateLocationDto = {
        location: { en: "Citadel Park", nl: "Citadelpark" },
      };
      const result = await service.createLocation(dto);
      expect(result).toEqual(mockLocation);
      expect(dbService.createLocation).toHaveBeenCalledWith(dto);
    });
  });

  describe("updateLocation", () => {
    it("should update a location in the database", async () => {
      const dto: ModifyLocationDto = {
        location: { en: "Updated Park", nl: "Bijgewerkt park" },
      };
      const result = await service.modifyLocation(1, dto);
      expect(result).toEqual(mockLocation);
      expect(dbService.updateLocation).toHaveBeenCalledWith(1, dto);
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
