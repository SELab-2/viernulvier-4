import { Injectable } from "@nestjs/common";

@Injectable()
export class ProductionsService {
  getAll(): string[] {
    return [
      "Cool production (placeholder)",
      "Another cool production (placeholder)",
    ];
  }

  getById(id: string): string {
    return `Production with id ${id} (placeholder)`;
  }
}
