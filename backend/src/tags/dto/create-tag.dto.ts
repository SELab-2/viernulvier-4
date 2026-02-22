import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateTagDto {
  @IsString({ message: 'De tag naam moet tekst zijn.' })
  @IsNotEmpty({ message: 'Een tag mag niet leeg zijn.' })
  tag: string;

  @IsNumber()
  @IsNotEmpty()
  production_id: number;
}