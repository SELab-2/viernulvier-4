import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import EventService from "../event.service";
import {
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from "@nestjs/swagger";
import { LanguageQueryDto, PriceDto, PriceViewDto } from "../../dto/dto";
import { ApiKeyGuard } from "../../auth/authGuard";
import { LanguageService } from "../../util/language/language.service";
import { LanguageQuerySchema } from "@repo/common";
import { ZodValidationPipe } from "nestjs-zod";
import { ApiOkArrayAnyOf } from "../../common/decorators/api.ok";

@ApiTags("Events - Prices")
@Controller("events/:eventId/prices")
export class EventPriceController {
  constructor(
    private readonly eventService: EventService,
    private readonly ls: LanguageService,
  ) {}

  /**
   * Responds to GET /events/:eventId/prices
   * @param eventId ID in the URL of the request.
   * @param lang is the desired language
   * @returns The Prices corresponding to this event.
   */
  @ApiOperation({
    summary: "Returns the Prices of an Event.",
  })
  @ApiOkArrayAnyOf(PriceDto, PriceViewDto)
  @Get()
  async getPricesOfEvent(
    @Param("eventId", ParseIntPipe) eventId: number,
    @Query(new ZodValidationPipe(LanguageQuerySchema)) lang: LanguageQueryDto,
  ): Promise<PriceDto[] | PriceViewDto[]> {
    return this.ls.flattenByLanguage<PriceDto[] | PriceViewDto[]>(
      await this.eventService.getPricesForEvent(eventId),
      lang.lang,
    );
  }

  /**
   * Responds to PUT to "/events/:eventId/prices/:priceId".
   * @param eventId The ID of the Event.
   * @param priceId The ID of the Price.
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Adds a Price to an Event." })
  @ApiOkResponse({
    description: "Successfully added Price to Event.",
  })
  @Put(":priceId")
  async addPriceToEvent(
    @Param("eventId", ParseIntPipe) eventId: number,
    @Param("priceId", ParseIntPipe) priceId: number,
  ): Promise<boolean> {
    return await this.eventService.addPriceToEvent(eventId, priceId);
  }

  /**
   * Responds to a DELETE to "/events/:eventId/prices/:priceId".
   * @param eventId The ID of the Event.
   * @param priceId is the ID of the price.
   * @returns Nothing
   */
  @UseGuards(ApiKeyGuard)
  @ApiSecurity("apiKey")
  @ApiOperation({ summary: "Removes a Price from an Event." })
  @ApiOkResponse({
    description: "Successfully removed Price from Event.",
  })
  @Delete(":priceId")
  async removePriceFromEvent(
    @Param("eventId", ParseIntPipe) eventId: number,
    @Param("priceId", ParseIntPipe) priceId: number,
  ): Promise<void> {
    await this.eventService.removePriceFromEvent(eventId, priceId);
  }
}
