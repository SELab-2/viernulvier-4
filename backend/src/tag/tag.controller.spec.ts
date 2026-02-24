import { Test, TestingModule } from '@nestjs/testing';
import { TagController } from './tag.controller';
import { TagService } from './tag.service';
import { ParseIntPipe } from '@nestjs/common';

describe('TagController', () => {
  let controller: TagController;
  let service: TagService;

  const mockTagService = {
    createTag: jest.fn(),
    findOneTag: jest.fn(),
    updateTag: jest.fn(),
    deleteTag: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TagController],
      providers: [
        {
          provide: TagService,
          useValue: mockTagService,
        },
      ],
    }).compile();

    controller = module.get<TagController>(TagController);
    service = module.get<TagService>(TagService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createTag', () => {
    it('should call service.creatTag', async () => {
      const dto = { tag: 'Action', production_id: 1 };
      await controller.createTag(dto);
      expect(service.createTag).toHaveBeenCalledWith(dto);
    });
  });

  describe('findOneTag', () => {
    it('should call service.findOneTag', async () => {
      await controller.findOneTag(1);
      expect(service.findOneTag).toHaveBeenCalledWith(1);
    });
  });

  describe('updateTag', () => {
    it('should call service.updateTag', async () => {
      const dto = { tag: 'Sci-Fi' };
      await controller.updateTag(1, dto);
      expect(service.updateTag).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('deleteTag', () => {
    it('should call service.deleteTag', async () => {
      await controller.deleteTag(1);
      expect(service.deleteTag).toHaveBeenCalledWith(1);
    });
  });
});
