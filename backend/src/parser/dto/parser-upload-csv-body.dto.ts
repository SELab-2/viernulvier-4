import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ParserUploadCsvBodyDto {
  @ApiProperty({ type: "string", format: "binary" })
  file?: unknown;

  @ApiPropertyOptional({
    description:
      "Optional fallback path on the server when no multipart file is uploaded.",
  })
  filePath?: string;
}
