import { Body, Controller, Delete, Post, UploadedFile, UseGuards, UseInterceptors, } from "@nestjs/common";
import { MediaStorageService } from "./service/media_storage.service";
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
@ApiTags("Media - Storage")
@Controller("media/storage")
export class MediaStorageController {
  constructor(private readonly mediaStorageService: MediaStorageService) {}

  /**
   * Responds to a POST to "media/storage/fetch"
   * @param body The URL of the media we want to fetch.
   * @returns The media as a buffer.
   * note: done like this, although weird, to allow having a body in the request which GET does not allow.
   */
  @ApiOperation({ summary: "Fetch media from a given URL." })
  @ApiBody({ schema: { properties: { url: { type: "string" } } } })
  @ApiOkResponse({ description: "Found media." })
  @Post("fetch")
  async getMedia(@Body() body: { url: string }): Promise<Buffer> {
    return await this.mediaStorageService.getMedia(body.url);
  }

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
   * @param body The URL of the media we want to delete.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Delete media at a given URL." })
  @ApiBody({ schema: { properties: { url: { type: "string" } } } })
  @ApiOkResponse({ description: "Deleted media." })
  @Delete()
  async deleteMedia(@Body() body: { url: string }): Promise<void> {
    await this.mediaStorageService.deleteMedia(body.url);
  }
}
