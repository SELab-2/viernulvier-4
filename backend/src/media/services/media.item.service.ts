import { Injectable } from "@nestjs/common";
import { MediaDatabaseService } from "../../database/db.media.service";

/**
 * Defines the connection between controller and database service
 * for media items.
 */
@Injectable()
export class MediaItemService {
  constructor(private readonly mediaDbService: MediaDatabaseService) {}
}
