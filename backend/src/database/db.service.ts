import { Pool, QueryResultRow } from "pg";
import { Injectable } from "@nestjs/common";
import { Language } from "@repo/common";

@Injectable()
export class DbService {
  private pool: Pool;

  // to edit database params go to your .env file.
  constructor() {
    this.pool = new Pool({
      user: process.env.DB_USER_DEV,
      host: process.env.DB_HOST_DEV,
      database: process.env.DB_NAME_DEV,
      password: process.env.DB_PASSWORD_DEV,
      port: Number(process.env.DB_PORT_DEV),
    });
  }

  /**
   * This function sends a query to the database.
   * @param query This is the to be executed query
   * @param params These are the possible parameters used in the query annotated by "$1",... as is convention in SQL.
   * @return a generic type that is a scheme of the database.
   * */
  async query<T extends QueryResultRow = any>(
    query: string,
    params?: any[],
  ): Promise<T[]> {
    const res = await this.pool.query<T>(query, params); // keep await.
    return res.rows;
  }

  /**
   * Utility.
   */

  // TODO: Move this to UtilModule.
  static flattenTranslation<T>(data: any, lang: Language | undefined): T {
    if (!data) return data as T;
    if (!lang) return data as T;

    if (Array.isArray(data)) {
      return data.map((item) => this.flattenTranslation(item, lang)) as T;
    }

    const flattened = { ...data } as Record<string, any>;

    for (const key in flattened) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const value = flattened[key];

      if (
        value !== null &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        !(value instanceof Date)
      ) {
        if (lang in value) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          flattened[key] = value[lang];
        } else {
          // TODO: Make this call the Google Translate API.
          flattened[key] = null;
        }
      }
    }

    return flattened as T;
  }
}
