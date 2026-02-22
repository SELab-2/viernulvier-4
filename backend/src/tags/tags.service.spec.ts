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

  describe('remove', () => {
    it('should throw NotFoundException if tag does not exist', async () => {
      mockDbService.query.mockResolvedValue([]);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});