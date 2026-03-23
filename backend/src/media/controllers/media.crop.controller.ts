import { Controller } from "@nestjs/common";
import { MediaCropService } from "../services/media.crop.service";

/**
 * Defines all media crop related endpoints
 */
@Controller("items/crops")
export class MediaCropController {
  constructor(private readonly mediaCropService: MediaCropService) {}
}
