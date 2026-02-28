import { Injectable } from "@nestjs/common";
import { DbService } from "./db.service";
import { ApiKeyDto } from "../dto/dto";
import crypto from "crypto";

@Injectable()
export class ApiKeyDatabaseService {
  constructor(private db: DbService) {}

  /**
   * Verify that an api is in the database.
   * @param apiKey the apiKey we are testing
   * @returns T/F depending on if the apiKey is active and in the db.
   */
  async verifyApiKey(apiKey: ApiKeyDto): Promise<boolean> {
    const query = `
        SELECT 1
        FROM api_keys
        WHERE key = $1 AND active = TRUE
        LIMIT 1
    `;
    const result = await this.db.query(query, [apiKey.key]);
    return result.length !== 0;
  }

  /**
   * Generates, inserts the api key into the database and returns an api key.
   * @returns the newly generated apiKey.
   */
  async generateKey(): Promise<ApiKeyDto> {
    // Generate secure random key
    const key = crypto.randomBytes(32).toString("hex");

    const query = `
      INSERT INTO api_keys (key, active)
      VALUES ($1, TRUE)
      RETURNING id, key, active
    `;

    const result = await this.db.query<ApiKeyDto>(query, [key]);

    return result[0];
  }

  /**
   * Remove an apiKey from the db.
   * note: we NEVER remove an api key from the database, we simply mark it as inactive.
   * @param apiKey the apiKey we want to delete
   * @returns T/F depending on if the apiKey was deleted.
   */
  async retireKey(apiKey: ApiKeyDto): Promise<boolean> {
    const query = `
      UPDATE api_keys
      SET active = FALSE
      WHERE key = $1 AND active = TRUE
      RETURNING id
    `;

    const result = await this.db.query(query, [apiKey.key]);

    return result.length !== 0;
  }
}
