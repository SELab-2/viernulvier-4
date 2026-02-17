import { Controller, Get } from '@nestjs/common';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
    constructor(private readonly eventsService: EventsService) {}

    @Get()
    getAll() : string[] {
        return this.eventsService.getAll();
    }

    @Get(':id')
    getById(id: string): string {
        return this.eventsService.getById(id);
    }
}
