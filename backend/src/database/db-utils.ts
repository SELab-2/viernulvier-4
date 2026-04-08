/**
 * Updating
 */

import { ZodObject } from "@repo/common";

/**
 * Contains the string that can be passed to SET and the corresponding values in order.
 * Also the next index after the set clause.
 */
export interface UpdateClause {
  setClause: string;
  values: any[];
  nextIndex: number;
}

/**
 * Generates an string that can be used after the SET SQL command from the provided object.
 * @param data The data we want to transform into a SET.
 * @param startingIndex The index to start counting from. (default = 1)
 * @returns An UpdateClause object.
 */
export function generateUpdateClause(
  data: Record<string, any>,
  startingIndex: number = 1,
): UpdateClause {
  const fields = [];
  const values = [];
  let index = startingIndex;

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      fields.push(`${key} = $${index++}`);
      values.push(value);
    }
  }

  return {
    setClause: fields.join(", "),
    values,
    nextIndex: index,
  };
}

/**
 * Insertion
 */

/**
 * Contains the string of columns to insert, their placeholders, and the values.
 */
export interface InsertClause {
  columns: string;
  placeholders: string;
  values: any[];
  nextIndex: number;
}

/**
 * Generates and InsertClause for inserting an object into the database.
 * @param data The object we want to insert.
 * @returns InsertClause object with the needed values.
 */
export function generateInsertClause(
  data: Record<string, any>,
  startingIndex: number = 1,
): InsertClause {
  const columns: string[] = [];
  const placeholders: string[] = [];
  const values: any[] = [];
  let index = startingIndex;

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      columns.push(key);
      placeholders.push(`$${index++}`);
      values.push(value);
    }
  }

  return {
    columns: columns.join(", "),
    placeholders: placeholders.join(", "),
    values,
    nextIndex: index,
  };
}

/**
 * Returning Generator
 */

/**
 * Generates a RETURNING (or SELECT) clause from a Zod Schema.
 * @param schema The Schema to generate from.
 * @returns The Clause.
 */
export function generateReturningClause(schema: ZodObject): string {
  return Object.keys(schema.shape).join(", ");
}

/**
 * Counting
 */

/**
 * Generates a COUNT query for the table provided. Looks at the id field.
 * @param tableName The table name to count.
 * @returns The query.
 */
export function generateCountQuery(tableName: string): string {
  const query = `
      SELECT COUNT(DISTINCT id) as count
      FROM ${tableName};
  `;
  return query;
}
