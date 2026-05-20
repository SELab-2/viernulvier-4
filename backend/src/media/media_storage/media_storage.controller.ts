import {
  Body,
  Controller,
  Delete,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { MediaStorageService } from "./media_storage.service";
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from "@nestjs/swagger";
import { ApiKeyGuard } from "../../auth/authGuard";
import { FileInterceptor } from "@nestjs/platform-express";

/**
 * Defines all media storage related endpoints
 * note: although you can fetch/post/delete through nginx directly, please fetch through here for:
 * 1. security reasons as this way nginx can accept only local requests for media
 * 2. if you are on dev instead of prod, the service will auto-adjust the url for you.
 */
@ApiTags("Media & Prints - Storage")
@Controller("media/storage")
export class MediaStorageController {
  constructor(private readonly mediaStorageService: MediaStorageService) {}

  /**
   * Responds to a POST to "media/storage"
   * @param url The URL where we want to save the media.
   * @param file The uploaded file.
   * @returns The URL of the saved media.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Save media to a given URL." })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        url: { type: "string" },
        file: { type: "string", format: "binary" },
      },
    },
  })
  @ApiCreatedResponse({ description: "Saved media, returns the URL." })
  @UseInterceptors(FileInterceptor("file"))
  @Post()
  async saveMedia(
    @Body("url") url: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<string> {
    return await this.mediaStorageService.saveMedia(url, file.buffer);
  }

  /**
   * Responds to a DELETE to "media/storage"
   * @param url is the url of the media you want to delete.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Delete media at a given URL." })
  @ApiOkResponse({ description: "Deleted media." })
  @Delete()
  async deleteMedia(@Query("url") url: string): Promise<void> {
    await this.mediaStorageService.deleteMedia(url);
  }
}
