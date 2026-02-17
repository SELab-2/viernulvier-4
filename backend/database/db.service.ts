import { Pool, QueryResultRow } from "pg";
import { Injectable } from "@nestjs/common";

@Injectable()
export class DbService {
    private pool: Pool;

    // edit this for new db params (i.e. non-static def) -> TODO
    constructor() {
        this.pool = new Pool({
            user: "selab",
            host: "127.0.0.1", // = localhost
            database: "selab2_dev",
            password: "404",
            port: 5432,
        });
    }

    // sends query to the db (all query types.) (to see what it returns exactly, see query)
    async query<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<T[]> {
        const res = await this.pool.query<T>(text, params); // keep await.
        return res.rows;
    }
}
