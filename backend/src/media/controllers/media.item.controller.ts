import { Controller } from "@nestjs/common";
import { MediaItemService } from "../services/media.item.service";

/**
 * Defines all media item related endpoints.
 */
@Controller("items")
export class MediaItemController {
  constructor(private readonly mediaItemService: MediaItemService) {}
}
