import { Test, TestingModule } from '@nestjs/testing';
import { TagService } from './tag.service';
import { TagDatabaseService } from '../database/db.tag.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

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
  describe('createTag', () => {
    it('should create a new tag', async () => {
      const dto = { tag: 'Action', production_id: 1 };
      // Simuleer een succesvolle database insert die het nieuwe record teruggeeft
      mockDbTagService.createTag.mockResolvedValue({ id: 1, ...dto });
      const result = await service.createTag(dto);
      expect(result.tag).toBe('Action');
      expect(mockDbTagService.createTag).toHaveBeenCalledWith(dto);
    });
  });

  /**
   * Testgroep voor het ophalen van één specifieke tag
   */
  describe('findOneTag', () => {
    it('should return a single tag if it exists', async () => {
      const expectedTag = { id: 1, tag: 'Drama' };
      mockDbTagService.getTagById.mockResolvedValue(expectedTag);

      const result = await service.findOneTag(1);
      expect(result).toEqual(expectedTag);
    });

    it('should throw NotFoundException if tag does not exist', async () => {
      // Simuleer een SELECT query die geen resultaten (lege array) oplevert
      mockDbTagService.getTagById.mockRejectedValue(new NotFoundException());
      await expect(service.findOneTag(999)).rejects.toThrow(NotFoundException);
    });
  });

  /**
   * Testgroep voor het bijwerken van bestaande tags (Issue #52)
   */
  describe('updateTag', () => {
    it('should update and return the tag', async () => {
      const dto = { tag: 'UpdatedTag' };
      const expectedResult = { id: 1, tag: 'UpdatedTag', production_id: 1 };
      mockDbTagService.updateTag.mockResolvedValue(expectedResult);

      const result = await service.updateTag(1, dto);
      expect(result.tag).toBe('UpdatedTag');
    });

    it('should throw BadRequestException if Ids do not match', async () => {
      const dto = { id: 2, tag: 'Mismatch' };
      await expect(service.updateTag(1, dto as any)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if tag to update is not found', async () => {
      mockDbTagService.updateTag.mockRejectedValue(new NotFoundException());
      await expect(service.updateTag(999, { tag: 'NonExistent' }))
        .rejects.toThrow(NotFoundException);
    });
  });

  /**
   * Testgroep voor het verwijderen van een tag
   */
  describe('deleteTag', () => {
    it('should successfully remove a tag and return a message', async () => {
      // Arrange: Simuleer dat de tag eerst wordt gevonden
      const tagId = 8;
      mockDbTagService.deleteTag.mockResolvedValue(undefined);

      // Act
      const result = await service.deleteTag(tagId);

      // Assert
      expect(result).toEqual({
        message: `Tag with ID ${tagId} has been removed successfully.`
      });
      expect(mockDbTagService.deleteTag).toHaveBeenCalledWith(tagId);
    });

    it('should throw NotFoundException if tag to remove does not exist', async () => {
      // Arrange: Simuleer dat getTagById een error gooit (tag niet gevonden)
      mockDbTagService.getTagById.mockRejectedValue(new NotFoundException());

      // Act & Assert
      await expect(service.deleteTag(999)).rejects.toThrow(NotFoundException);
    });
  });
});