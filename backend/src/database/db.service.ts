import { Pool, QueryResultRow } from "pg";
import { Injectable } from "@nestjs/common";

@Injectable()
export class DbService {
  private pool: Pool;

  // to edit database params go to your .env file.
  constructor() {
    this.pool = new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: Number(process.env.DB_PORT),
    });
  }

  // sends query to the db (all query types.) (to see what it returns exactly, see query)
  async query<T extends QueryResultRow = any>(
    text: string,
    params?: any[],
  ): Promise<T[]> {
    const res = await this.pool.query<T>(text, params); // keep await.
    return res.rows;
  }
}
