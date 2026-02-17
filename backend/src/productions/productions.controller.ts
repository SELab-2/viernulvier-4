import { Controller, Get } from '@nestjs/common';
import { ProductionsService } from './productions.service';

@Controller('productions')
export class ProductionsController {
    constructor(private readonly productionsService: ProductionsService) {}

    @Get()
    getAll() : string[] {
        return this.productionsService.getAll();
    }

    @Get(':id')
    getById(id: string): string {
        return this.productionsService.getById(id);
    }

}
