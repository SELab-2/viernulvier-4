import { Injectable } from "@nestjs/common";
import { MediaDatabaseService } from "../../database/db.media.service";

/**
 * Defines the connection between controller and database service
 * for media crops.
 */
@Injectable()
export class MediaCropService {
  constructor(private readonly mediaDbService: MediaDatabaseService) {}
}
