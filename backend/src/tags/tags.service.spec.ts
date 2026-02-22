import { Test, TestingModule } from '@nestjs/testing';
import { TagsService } from './tags.service';
import { DbService } from '../database/db.service';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';

describe('TagsService', () => {
  let service: TagsService;
  let dbService: DbService;

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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new tag', async () => {
      const dto = { tag: 'TestTag', production_id: 1 };
      const expectedResult = { id: 1, ...dto };
      mockDbService.query.mockResolvedValue([expectedResult]);
      const result = await service.create(dto);
      expect(result).toEqual(expectedResult);
      expect(mockDbService.query).toHaveBeenCalled();
    });

    it('should throw an error if database fails', async () => {
      mockDbService.query.mockRejectedValue(new Error('DB Error'));
      await expect(service.create({ tag: 'Fail', production_id: 1 })).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findAll', () => {
    it('should return an array of tags', async () => {
      const expectedTags = [{ id: 1, tag: 'Drama' }, { id: 2, tag: 'Comedy' }];
      mockDbService.query.mockResolvedValue(expectedTags);

      const result = await service.findAll();
      expect(result).toEqual(expectedTags);
      expect(mockDbService.query).toHaveBeenCalledWith('SELECT * FROM tags;');
    });
  });

  describe('findOne', () => {
    it('should return a single tag if it exists', async () => {
      const expectedTag = { id: 1, tag: 'Drama' };
      mockDbService.query.mockResolvedValue([expectedTag]);

      const result = await service.findOne(1);
      expect(result).toEqual(expectedTag);
    });

    it('should throw NotFoundException if tag does not exist', async () => {
      mockDbService.query.mockResolvedValue([]);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

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

  describe('remove', () => {
    it('should throw NotFoundException if tag does not exist', async () => {
      mockDbService.query.mockResolvedValue([]);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});