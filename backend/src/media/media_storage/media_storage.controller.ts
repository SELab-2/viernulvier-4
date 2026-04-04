import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { MediaStorageService } from "./service/media_storage.service";
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiSecurity,
  ApiTags,
} from "@nestjs/swagger";
import { ApiKeyGuard } from "../../auth/authGuard";
import { FileInterceptor } from "@nestjs/platform-express";
import path from "node:path";

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
   * Responds to a GET to "media/storage/fetch"
   * @param url The URL of the media we want to fetch.
   * @returns The media as a downloadable/viewable file stream.
   */
  @ApiOperation({ summary: "Fetch media from a given URL." })
  @ApiQuery({
    name: "url",
    type: "string",
    description: "The URL of the media (must be URL-encoded on the frontend)",
  })
  @ApiOkResponse({ description: "Found media." })
  @Get("fetch")
  async getMedia(@Query("url") url: string): Promise<StreamableFile> {
    const buffer = await this.mediaStorageService.getMedia(url);

    let contentType: string;
    const parsedUrl = new URL(url);
    const filename = path.basename(parsedUrl.pathname);
    const ext = path.extname(parsedUrl.pathname);
    switch (ext) {
      case ".jpg":
      case ".jpeg":
        contentType = "image/jpeg";
        break;
      case ".png":
        contentType = "image/png";
        break;
      case ".gif":
        contentType = "image/gif";
        break;
      case ".webp":
        contentType = "image/webp";
        break;
      case ".pdf":
        contentType = "application/pdf";
        break;
      default:
        contentType = "application/octet-stream";
        break;
    }

    // return a file so this way we can actually see the file in swagger.
    return new StreamableFile(buffer, {
      type: contentType,
      disposition: `attachment: filename="${filename}"`,
    });
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
  @ApiOkResponse({ description: "Deleted media." })
  @Delete()
  async deleteMedia(@Query("url") url: string): Promise<void> {
    await this.mediaStorageService.deleteMedia(url);
  }
}
