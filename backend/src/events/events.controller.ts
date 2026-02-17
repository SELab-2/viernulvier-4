import { Controller, Get, Param } from '@nestjs/common';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
    constructor(private readonly eventsService: EventsService) {}

    // GET /events
    @Get()
    getAll() : string[] {
        return this.eventsService.getAll();
    }

    // GET /events/:id
    @Get(':id')
    getById(@Param('id') id: string): string {
        return this.eventsService.getById(id);
    }
}
