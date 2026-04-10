import { Pool, QueryResultRow } from "pg";
import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class DbService implements OnModuleDestroy {
  private pool: Pool;

  // to edit database params go to your .env file.
  constructor(private readonly configService: ConfigService) {
    this.pool = new Pool({
      user: this.configService.get<string>("DB_USER_DEV"),
      host: this.configService.get<string>("DB_HOST_DEV"),
      database: this.configService.get<string>("DB_NAME_DEV"),
      password: this.configService.get<string>("DB_PASSWORD_DEV"),
      port: Number(this.configService.get<string>("DB_PORT_DEV")),
    });
  }

  /**
   * Automatically destroy the database connection on stop.
   */
  async onModuleDestroy() {
    await this.pool.end();
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
}
