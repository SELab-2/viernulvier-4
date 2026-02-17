import {BadRequestException, Injectable} from "@nestjs/common";
import { DbService } from "../db.service";
import { Production } from "../database_objects";

@Injectable()
export class ProductionService {
    constructor(private db: DbService) {}

    // generic GET function (used only as intermediary end-point)
    // TODO add extra search terms?
    async getProductions(
        filters: Partial<{ genre: string; hall: string; date: string ; titel: string}>
    ): Promise<Production[]> {
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
        if (filters.hall) {
            conditions.push(`p.titel = $${i}`);
            values.push(filters.hall);
            i++;
        }

        const whereClause =
            conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

        // p is defined, ignore error
        // need DISTINCT as multiple events for each prod.
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

        return this.db.query<Production>(query, values);
    }

    // generic PUT function (used only as intermediary end-point)
    async createProduction(
        production: Partial<Production>
    ): Promise<Production> {
        if (
            !production.titel ||
            !production.ondertitel ||
            !production.genre
        ) {
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
                production.blog_text ?? null
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
                production.blog_text ?? null
            ];
        }

        const result = await this.db.query<Production>(query, values);

        if (!result?.length) {
            throw new Error("Failed to create production");
        }

        return result[0];
    }

    // generic POST function
    async updateProduction(event: Omit<Production, "id">): Promise<Production> {
        // TODO this needed?
        return new Promise(async (resolve, reject) => {})
    }

    // generic DELETE function
    async deleteEvent(id: number): Promise<Production> {
        // TODO this needed?
        return new Promise(async (resolve, reject) => {})
    }
}