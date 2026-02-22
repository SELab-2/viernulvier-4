import { Test, TestingModule } from '@nestjs/testing';
import { TagsService } from './tags.service';
import { DbService } from '../database/db.service';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';

describe('TagsService', () => {
  let service: TagsService;
  let dbService: DbService;

  /**
   * Mock object voor DbService om database-interactie te simuleren 
   * zonder een echte verbinding nodig te hebben.
   */
  const mockDbService = {
    query: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TagsService,
        {
          provide: DbService,
          useValue: mockDbService,
        },
      ],
    }).compile();

    service = module.get<TagsService>(TagsService);
    dbService = module.get<DbService>(DbService);

    // Reset de mocks voor elke test om vervuiling tussen tests te voorkomen
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  /**
   * Testgroep voor het aanmaken van nieuwe tags (Issue #55)
   */
  describe('create', () => {
    it('should create a new tag', async () => {
      const dto = { tag: 'TestTag', production_id: 1 };
      const expectedResult = { id: 1, ...dto };
      // Simuleer een succesvolle database insert die het nieuwe record teruggeeft
      mockDbService.query.mockResolvedValue([expectedResult]);
      const result = await service.create(dto);
      expect(result).toEqual(expectedResult);
      expect(mockDbService.query).toHaveBeenCalled();
    });

    it('should throw an error if database fails', async () => {
      // Simuleer een onverwachte databasefout (bijv. connectieverlies)
      mockDbService.query.mockRejectedValue(new Error('DB Error'));
      await expect(service.create({ tag: 'Fail', production_id: 1 })).rejects.toThrow(InternalServerErrorException);
    });
  });

  /**
   * Testgroep voor het ophalen van alle tags
   */
  describe('findAll', () => {
    it('should return an array of tags', async () => {
      const expectedTags = [{ id: 1, tag: 'Drama' }, { id: 2, tag: 'Comedy' }];
      mockDbService.query.mockResolvedValue(expectedTags);

      const result = await service.findAll();
      expect(result).toEqual(expectedTags);
      expect(mockDbService.query).toHaveBeenCalledWith('SELECT * FROM tags;');
    });
  });

  /**
   * Testgroep voor het ophalen van één specifieke tag
   */
  describe('findOne', () => {
    it('should return a single tag if it exists', async () => {
      const expectedTag = { id: 1, tag: 'Drama' };
      mockDbService.query.mockResolvedValue([expectedTag]);

      const result = await service.findOne(1);
      expect(result).toEqual(expectedTag);
    });

    it('should throw NotFoundException if tag does not exist', async () => {
      // Simuleer een SELECT query die geen resultaten (lege array) oplevert
      mockDbService.query.mockResolvedValue([]);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  /**
   * Testgroep voor het bijwerken van bestaande tags (Issue #52)
   */
  describe('update', () => {
    it('should update and return the tag', async () => {
      const dto = { tag: 'UpdatedTag' };
      const expectedResult = { id: 1, tag: 'UpdatedTag', production_id: 1 };
      mockDbService.query.mockResolvedValue([expectedResult]);

      const result = await service.update(1, dto);
      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException if tag to update is not found', async () => {
      mockDbService.query.mockResolvedValue([]);
      await expect(service.update(999, { tag: 'NonExistent' }))
        .rejects.toThrow(NotFoundException);
    });
  });

  /**
   * Testgroep voor het verwijderen van tags (Issue #50)
   */
  describe('remove', () => {
    it('should throw NotFoundException if tag does not exist', async () => {
      // Bij een DELETE query met RETURNING * geeft een lege array aan dat er niets verwijderd is
      mockDbService.query.mockResolvedValue([]);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});