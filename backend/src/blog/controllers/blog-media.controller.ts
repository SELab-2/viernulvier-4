import { Controller, Delete, Get, Param, ParseEnumPipe, ParseIntPipe, Put, Query, UseGuards, } from "@nestjs/common";
import { BlogService } from "../blog.service";
import { ApiOkResponse, ApiOperation, ApiQuery, ApiSecurity, ApiTags, } from "@nestjs/swagger";
import { MediaGalleryDto } from "../../dto/dto";
import { ApiKeyGuard } from "../../auth/authGuard";
import type { GalleryType } from "@repo/common";
import { GalleryTypeEnum } from "@repo/common";

@ApiTags("Blogs - Media")
@Controller("blogs/:blogId/media")
export class BlogMediaController {
  constructor(private readonly blogService: BlogService) {}

  /**
   * Responds to a GET to "/blogs/:blogId/media"
   * This endpoint only returns one singular Gallery
   * because in any case only one will be assigned to a Blog.
   * @param blogId The ID of the blog.
   * @param type The type of media wanted.
   * @returns The media gallery associated with this blog.
   */
  @ApiOperation({ summary: "Fetches the media gallery for a blog." })
  @ApiOkResponse({ type: MediaGalleryDto, description: "Gallery found." })
  @ApiQuery({
    name: "type",
    enum: GalleryTypeEnum.enum,
    description: "The type of media wanted.",
  })
  @Get()
  async getMedia(
    @Param("blogId", ParseIntPipe) blogId: number,
    @Query("type", new ParseEnumPipe(GalleryTypeEnum)) type: GalleryType,
  ): Promise<MediaGalleryDto> {
    return await this.blogService.getMedia(blogId, type);
  }

  /**
   * Responds to a PUT to "/blogs/:blogId/media/:galleryId"
   * @param blogId The ID of the blog
   * @param galleryId The ID of the gallery.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Link a media gallery to a blog." })
  @ApiOkResponse({ type: MediaGalleryDto, description: "Gallery linked." })
  @Put(":galleryId")
  async linkMedia(
    @Param("blogId", ParseIntPipe) blogId: number,
    @Param("galleryId", ParseIntPipe) galleryId: number,
  ): Promise<void> {
    await this.blogService.linkMediaToBlog(blogId, galleryId);
  }

  /**
   * Responds to a DELETE to "/blogs/:blogId/media/:galleryId"
   * @param blogId The ID of the blog
   * @param galleryId The ID of the gallery.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Unlinks a media gallery from a blog." })
  @ApiOkResponse({ type: MediaGalleryDto, description: "Gallery unlinked." })
  @Delete(":galleryId")
  async unlinkMedia(
    @Param("blogId", ParseIntPipe) blogId: number,
    @Param("galleryId", ParseIntPipe) galleryId: number,
  ): Promise<void> {
    await this.blogService.unlinkMediaFromBlog(blogId, galleryId);
  }
}
