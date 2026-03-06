import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import { PriceService } from "./price.service";
import {
  CreatePriceDto,
  PaginationFilterDto,
  PriceDto,
  UpdatePriceDto,
} from "../dto/dto";
import { ZodValidationPipe } from "nestjs-zod";
import {
  CreatePriceSchema,
  PaginationFilterSchema,
  UpdatePriceSchema,
} from "@repo/common";
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
} from "@nestjs/swagger";
import { ApiKeyGuard } from "../auth/authGuard";

@Controller("prices")
export class PriceController {
  constructor(private readonly priceService: PriceService) {}

  /**
   * Responds to a GET to "/prices".
   * @param paginationFilter The Filter for pagination used.
   * @returns A list of Price objects.
   */
  @ApiOperation({ summary: "Fetches All Prices." })
  @ApiOkResponse({
    type: PriceDto,
    isArray: true,
    description: "Returned Prices.",
  })
  @UsePipes(new ZodValidationPipe(PaginationFilterSchema))
  @Get()
  async getPrices(
    @Query() paginationFilter: PaginationFilterDto,
  ): Promise<PriceDto[]> {
    return await this.priceService.getPrices(paginationFilter);
  }

  /**
   * Responds to a GET to "/prices/:priceId"
   * @param priceId The ID of the Price we want to fetch.
   * @returns The specific Price if it exists.
   */
  @ApiOperation({ summary: "Fetches a specific Price." })
  @ApiOkResponse({ type: PriceDto, description: "Returned Price." })
  @Get(":priceId")
  async getPriceById(
    @Param("priceId", ParseIntPipe) priceId: number,
  ): Promise<PriceDto> {
    return await this.priceService.getPriceById(priceId);
  }

  /**
   * Responds to a POST to "/prices".
   * @param createPrice The Price object we want to create.
   * @returns The newly created Price.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Creates a new Price object." })
  @ApiBody({ type: CreatePriceDto })
  @ApiCreatedResponse({ type: PriceDto, description: "Created Price." })
  @UsePipes(new ZodValidationPipe(CreatePriceSchema))
  @Post()
  async createPrice(@Body() createPrice: CreatePriceDto): Promise<PriceDto> {
    return await this.priceService.createPrice(createPrice);
  }

  /**
   * Responds to a PUT to "/prices".
   * @param updatePrice The Price we want to update.
   * @returns The newly updated Price.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Updates an existing Price object." })
  @ApiBody({ type: UpdatePriceDto })
  @ApiOkResponse({ type: PriceDto, description: "Updated Price." })
  @UsePipes(new ZodValidationPipe(UpdatePriceSchema))
  @Put()
  async updatePrice(@Body() updatePrice: UpdatePriceDto): Promise<PriceDto> {
    return await this.priceService.updatePrice(updatePrice);
  }

  /**
   * Responds to a DELETE to "/prices/:priceId".
   * @param priceId The ID of the Price we want to delete.
   * @returns Nothing.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Deletes an existing Price object." })
  @ApiOkResponse({ description: "Deleted Price." })
  @Delete(":priceId")
  async deletePrice(@Param("priceId") priceId: number): Promise<void> {
    return await this.priceService.deletePrice(priceId);
  }
}
