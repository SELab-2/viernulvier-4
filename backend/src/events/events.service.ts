import { Injectable } from '@nestjs/common';

@Injectable()
export class EventsService {

    getAll() : string[] {
        return ["Cool event (placeholder)", "Another cool event (placeholder)"];
    }

    getById(id: string) : string {
        return `Event with id ${id} (placeholder)`;
    }
}
