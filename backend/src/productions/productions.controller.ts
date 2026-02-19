import { Controller, Get, Param } from '@nestjs/common';
import { ProductionsService } from './productions.service';

@Controller('productions')
export class ProductionsController {
    constructor(private readonly productionsService: ProductionsService) {}

    // GET /productions
    @Get()
    getAll() : string[] {
        return this.productionsService.getAll();
    }

    // GET /productions/:id
    @Get(':id')
    getById(@Param('id') id: string): string {
        return this.productionsService.getById(id);
    }

}
