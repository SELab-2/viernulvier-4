import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { DbService } from "./db.service";
import { ProductionDto } from "../dto/dto"; 
import { ProductionSchema } from "@repo/common";

@Injectable()
export class ProductionDatabaseService {
  constructor(private db: DbService) {}

  /**
   * Get a single ProductionDto by their ID.
   * @param id The ID we are looking for.
   * @returns The production if there is one.
   */
  async getProductionById(id: number): Promise<ProductionDto> {
    const productions: ProductionDto[] = await this.getProductions({ id: id });
    if (productions.length === 0)
      throw new BadRequestException(
        `No ProductionDto exists for provided ID(${id})`,
      );

    return productions[0]; // There should be a ProductionDto in here if the length is not 0.
  }

  // generic GET function (used only as intermediary end-point)
  // TODO add extra search terms?
  async getProductions(
    filters: Partial<{
      genre: string;
      hall: string;
      date: string;
      titel: string;
      id: number;
    }>,
  ): Promise<ProductionDto[]> {
    const conditions: string[] = [];
    const values: any[] = [];
    let i = 1;

    // Filter by production genre
    if (filters.genre) {
      conditions.push(`p.genre = $${i}`);
      values.push(filters.genre);
      i++;
    }

    // Filter by location
    if (filters.hall) {
      conditions.push(`e.hall = $${i}`);
      values.push(filters.hall);
      i++;
    }

    // Filter by event date (start or end date)
    if (filters.date) {
      conditions.push(`(DATE(e.starttime) = $${i} OR DATE(e.endtime) = $${i})`);
      values.push(filters.date);
      i++;
    }

    // Filter by titel
    if (filters.titel) {
      conditions.push(`p.titel = $${i}`);
      values.push(filters.titel);
      i++;
    }

    // Filter by id
    if (filters.id) {
      conditions.push(`p.id = $${i}`);
      values.push(filters.id);
      i++;
    }

    // add more filters here if needed.

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // p is defined, ignore error
    // need DISTINCT as multiple event for each prod.
    const query = `
      SELECT DISTINCT
        p.id,
        p.titel,
        p.ondertitel,
        p.description1,
        p.description2,
        p.genre,
        p.planning_id,
        p.blog_titel,
        p.blog_text
      FROM productions p
        LEFT JOIN events e ON e.production_id = p.id 
          ${whereClause}
      ORDER BY p.id
    `;

    return this.db.query<ProductionDto>(query, values);
  }

  // generic PUT function (used only as intermediary end-point)
  async createProduction(production: Partial<ProductionDto>): Promise<ProductionDto> {
    if (!production.titel || !production.ondertitel || !production.genre) {
      throw new BadRequestException("Missing required fields");
    }

    let query: string;
    let values: any[];

    // If id is provided → include it
    if (production.id !== undefined && production.id !== null) {
      query = `
        INSERT INTO productions (
                id,
                titel,
                ondertitel,
                description1,
                description2,
                genre,
                planning_id,
                blog_titel,
                blog_text
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
            RETURNING
                id,
                titel,
                ondertitel,
                description1,
                description2,
                genre,
                planning_id,
                blog_titel,
                blog_text
        `;

      values = [
        production.id,
        production.titel,
        production.ondertitel,
        production.description1,
        production.description2,
        production.genre,
        production.planning_id ?? null,
        production.blog_titel ?? null,
        production.blog_text ?? null,
      ];
    }
    // if not, fallback to db autogenerate
    else {
      query = `
            INSERT INTO productions (
                titel,
                ondertitel,
                description1,
                description2,
                genre,
                planning_id,
                blog_titel,
                blog_text
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
            RETURNING
                id,
                titel,
                ondertitel,
                description1,
                description2,
                genre,
                planning_id,
                blog_titel,
                blog_text
        `;

      values = [
        production.titel,
        production.ondertitel,
        production.description1,
        production.description2,
        production.genre,
        production.planning_id ?? null,
        production.blog_titel ?? null,
        production.blog_text ?? null,
      ];
    }

    const result = await this.db.query<ProductionDto>(query, values);

    if (!result?.length) {
      throw new Error("Failed to create production");
    }

    return ProductionSchema.parse(result[0]);
  }

  // generic POST function
  async updateProduction(
    id: number,
    production: Omit<ProductionDto, "id">,
  ): Promise<ProductionDto> {
    // Validate input fields
    if (
      !production.titel ||
      !production.ondertitel ||
      !production.description1 ||
      !production.genre
    ) {
      throw new BadRequestException("Missing required fields");
    }

    const query = `
      UPDATE productions
      SET 
        titel = $1,
        ondertitel = $2,
        description1 = $3,
        description2 = $4,
        genre = $5,
        planning_id = $6,
        blog_titel = $7,
        blog_text = $8
      WHERE id = $9
      RETURNING *
    `;

    const values = [
      production.titel,
      production.ondertitel,
      production.description1,
      production.description2,
      production.genre,
      production.planning_id,
      production.blog_titel,
      production.blog_text,
      id,
    ];

    const result = await this.db.query<ProductionDto>(query, values);

    if (!result || result.length === 0) {
      throw new NotFoundException(`ProductionDto with id ${id} not found`);
    }

    return ProductionSchema.parse(result[0]);
  }

  // generic DELETE function
  // TODO: Make this also remove all Events linked to this ProductionDto?
  async deleteProduction(id: number): Promise<ProductionDto> {
    const query = `
      DELETE FROM productions
      WHERE id = $1
      RETURNING *
    `;

    const result = await this.db.query<ProductionDto>(query, [id]);

    if (!result || result.length === 0) {
      throw new NotFoundException(`ProductionDto with id ${id} not found`);
    }

    return ProductionSchema.parse(result[0]);
  }

  // TODO add extra functionality here. I.e. search by id  function, get all possible genres, etc...
}
