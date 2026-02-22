import { Test, TestingModule } from '@nestjs/testing';
import { TagService } from './tag.service';
import { TagDatabaseService } from '../database/db.tag.service';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';

describe('TagService', () => {
  let service: TagService;
  let dbService: TagDatabaseService;

  /**
   * Mock object voor DbService om database-interactie te simuleren 
   * zonder een echte verbinding nodig te hebben.
   */
  const mockDbTagService = {
    createTag: jest.fn(),
    getTagById: jest.fn(),
    getTagsByProductionID: jest.fn(),
    getAllTags: jest.fn(),
    updateTag: jest.fn(),
    deleteTag: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TagService,
        {
          provide: TagDatabaseService,
          useValue: mockDbTagService,
        },
      ],
    }).compile();

    service = module.get<TagService>(TagService);
    dbService = module.get<TagDatabaseService>(TagDatabaseService);

    // Reset de mocks voor elke test om vervuiling tussen tests te voorkomen
    jest.clearAllMocks();
  });

  /**
   * Testgroep voor het aanmaken van nieuwe tags
   */
  describe('create', () => {
    it('should create a new tag', async () => {
      const dto = { tag: 'TestTag', production_id: 1 };
      // Simuleer een succesvolle database insert die het nieuwe record teruggeeft
      mockDbTagService.createTag.mockResolvedValue({ id: 1, ...dto });
      const result = await service.create(dto);
      expect(result.tag).toBe('TestTag');
      expect(mockDbTagService.createTag).toHaveBeenCalledWith(dto);
    });

    it('should throw an error if database fails', async () => {
      // Simuleer een onverwachte databasefout (bijv. connectieverlies)
      mockDbTagService.createTag.mockRejectedValue(new Error('DB Error'));
      await expect(service.create({ tag: 'X', production_id: 1 })).rejects.toThrow(InternalServerErrorException);
    });
  });

  /**
   * Testgroep voor het ophalen van alle tags
   */
  describe('findAll', () => {
    it('should return an array of tags', async () => {
      const expectedTags = [{ id: 1, tag: 'Drama' }, { id: 2, tag: 'Comedy' }];
      mockDbTagService.getAllTags.mockResolvedValue(expectedTags);

      const result = await service.findAll();
      expect(result).toEqual(expectedTags);
      expect(mockDbTagService.getAllTags).toHaveBeenCalled();
    });
  });

  /**
   * Testgroep voor het ophalen van tags gekoppeld aan een specifieke productie
   */
  describe('findAllByProduction', () => {
    it('should return an array of tags for a specific production', async () => {
      // Arrange: Bereid de testdata en de mock voor
      const productionId = 1;
      const expectedTags = [
        { id: 8, production_id: 1, tag: 'Drama' },
        { id: 9, production_id: 1, tag: 'Comedy' }
      ];
      mockDbTagService.getTagsByProductionID.mockResolvedValue(expectedTags);

      // Act: Roep de service functie aan
      const result = await service.findAllByProduction(productionId);

      // Assert: Controleer of het resultaat klopt en de mock correct is aangeroepen
      expect(result).toEqual(expectedTags);
      expect(mockDbTagService.getTagsByProductionID).toHaveBeenCalledWith(productionId);
    });

    it('should throw NotFoundException if no tags are found for the production', async () => {
      // Arrange: Simuleer de Error die de TagDatabaseService gooit bij een lege resultaatset
      mockDbTagService.getTagsByProductionID.mockRejectedValue(new Error('Blog not found'));

      // Act & Assert: Controleer of de service dit vertaalt naar een NotFoundException
      await expect(service.findAllByProduction(999))
        .rejects.toThrow(NotFoundException);
    });
  });


  /**
   * Testgroep voor het ophalen van één specifieke tag
   */
  describe('findOne', () => {
    it('should return a single tag if it exists', async () => {
      const expectedTag = { id: 1, tag: 'Drama' };
      mockDbTagService.getTagById.mockResolvedValue(expectedTag);

      const result = await service.findOne(1);
      expect(result).toEqual(expectedTag);
    });

    it('should throw NotFoundException if tag does not exist', async () => {
      // Simuleer een SELECT query die geen resultaten (lege array) oplevert
      mockDbTagService.getTagById.mockRejectedValue(new NotFoundException());
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
      mockDbTagService.updateTag.mockResolvedValue(expectedResult);

      const result = await service.update(1, dto);
      expect(result.tag).toBe('UpdatedTag');
    });

    it('should throw NotFoundException if tag to update is not found', async () => {
      mockDbTagService.updateTag.mockRejectedValue(new NotFoundException());
      await expect(service.update(999, { tag: 'NonExistent' }))
        .rejects.toThrow(NotFoundException);
    });
  });

  /**
   * Testgroep voor het verwijderen van een tag
   */
  describe('remove', () => {
    it('should successfully remove a tag and return a message', async () => {
      // Arrange: Simuleer dat de tag eerst wordt gevonden
      const tagId = 8;
      const existingTag = { id: tagId, tag: 'Action', production_id: 1 };
      mockDbTagService.getTagById.mockResolvedValue(existingTag);
      mockDbTagService.deleteTag.mockResolvedValue(undefined);

      // Act
      const result = await service.remove(tagId);

      // Assert
      expect(result).toEqual({
        message: `Tag with ID ${tagId} has been removed successfully.`
      });
      expect(mockDbTagService.getTagById).toHaveBeenCalledWith(tagId);
      expect(mockDbTagService.deleteTag).toHaveBeenCalledWith(tagId);
    });

    it('should throw NotFoundException if tag to remove does not exist', async () => {
      // Arrange: Simuleer dat getTagById een error gooit (tag niet gevonden)
      mockDbTagService.getTagById.mockRejectedValue(new Error('Tag not found'));

      // Act & Assert
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      // Controleer dat deleteTag nooit is aangeroepen omdat de check al faalde
      expect(mockDbTagService.deleteTag).not.toHaveBeenCalled();
    });
  });
});