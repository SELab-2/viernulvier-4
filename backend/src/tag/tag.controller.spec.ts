import { Test, TestingModule } from '@nestjs/testing';
import { TagController } from './tag.controller';
import { TagService } from './tag.service';
import { TagDto, CreateTagDto, UpdateTagDto } from '../dto/dto';
import { NotFoundException } from '@nestjs/common';

describe('TagController', () => {
  let controller: TagController;
  let service: TagService;

  const mockTag: TagDto = {
    id: 1,
    tag: 'Drama',
    production_id: 101,
  } as TagDto;

  const mockTags: TagDto[] = [mockTag];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TagController],
      providers: [
        {
          provide: TagService,
          useValue: {
            getAllTags: jest.fn().mockResolvedValue(mockTags),
            getTagById: jest.fn().mockResolvedValue(mockTag),
            createTag: jest.fn().mockResolvedValue(mockTag),
            updateTag: jest.fn().mockResolvedValue(mockTag),
            deleteTag: jest.fn().mockResolvedValue({ message: 'Success' }),
          },
        },
      ],
    }).compile();

    controller = module.get<TagController>(TagController);
    service = module.get<TagService>(TagService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createTag', () => {
    it('should create and return a new tag', async () => {
      const dto = { tag: 'Action', production_id: 101 };
      const result = await controller.createTag(dto as CreateTagDto);
      expect(service.createTag).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockTag);
    });
  });

  describe('getTagById', () => {
    it('should return a single tag by id', async () => {
      const result = await controller.getTagById(1);
      expect(result).toEqual(mockTag);
      expect(service.getTagById).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if tag not found', async () => {
      jest.spyOn(service, 'getTagById').mockRejectedValue(new NotFoundException());
      await expect(controller.getTagById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAllTags', () => {
    it('should return an array of tags', async () => {
      const result = await controller.getAllTags();
      expect(result).toEqual(mockTags);
      expect(service.getAllTags).toHaveBeenCalled();
    });
  });

  describe('updateTag', () => {
    it('should update and return the tag', async () => {
      const dto = { tag: 'Updated' };
      const result = await controller.updateTag(1, dto as UpdateTagDto);
      expect(service.updateTag).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(mockTag);
    });
  });

  describe('deleteTag', () => {
    it('should call service.deleteTag', async () => {
      await controller.deleteTag(1);
      expect(service.deleteTag).toHaveBeenCalledWith(1);
    });
  });
});
