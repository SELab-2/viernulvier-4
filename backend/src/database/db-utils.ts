/**
 * Updating
 */

import { Language, SUPPORTED_LANGUAGES, ZodObject } from "@repo/common";
import {
  InvalidReferenceException,
  SystemFailureException,
} from "../common/exceptions";

/**
 * Interface for handling of postgres error codes.
 */
export interface PostgresError {
  code: string;
}

/**
 * Returns whether something is a plain object or not.
 * @param value The value.
 * @returns T/F.
 */
function isPlainObject(value: any): boolean {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    !(value instanceof Date)
  );
}

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
      if (isPlainObject(value)) {
        // If JSON we handle differently.
        fields.push(
          `${key} = COALESCE(${key}, '{}'::jsonb) || $${index++}::jsonb`,
        );
        values.push(JSON.stringify(value));
      } else {
        // Everything else.
        fields.push(`${key} = $${index++}`);
        values.push(value);
      }
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
 * Filtering
 */

/**
 * Generates a Filtering Clause for an SQL Query for exact matches.
 * So if something needs to be an exact ID or an exact string you can feed
 * the values into this and it will automatically generate the queries.
 * @param filters The object containing the filter values.
 * @param exactColumns A list of the keys you want to exactly filter for.
 * @param conditions The array the conditions should be added to afterwards.
 * @param param A lambda function that will generate the $x placeholders.
 * @param prefix An optional prefix for the to filter values (eg. p."x")
 */
export function applyExactFilters(
  filters: Record<string, any>,
  exactColumns: string[],
  conditions: string[],
  param: (val: any) => string,
  prefix: string = "",
): void {
  const pre = prefix ? `${prefix}.` : "";

  for (const col of exactColumns) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const val = filters[col];

    // Ignore undefined, null, or empty strings
    if (val !== undefined && val !== null && val !== "") {
      // If it's an array, use Postgres ANY() for an IN clause
      if (Array.isArray(val)) {
        conditions.push(`${pre}${col} = ANY(${param(val)})`);
      } else {
        // Standard exact match
        conditions.push(`${pre}${col} = ${param(val)}`);
      }
    }
  }
}

/**
 * Returning Generator
 */

/**
 * Generates a RETURNING (or SELECT) clause from a Zod Schema.
 * @param schema The Schema to generate from.
 * @param prefix Optional prefix to add before every clause (eg "mc" -> "mc.name")
 * @returns The Clause.
 */
export function generateReturningClause(
  schema: ZodObject,
  prefix: string = "",
): string {
  const pre = prefix ? `${prefix}.` : "";

  return Object.keys(schema.shape)
    .map((key) => `${pre}${key}`)
    .join(", ");
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
      SELECT COUNT(id) as count
      FROM ${tableName};
  `;
  return query;
}

/**
 * Relevance Sorting
 */

/**
 * A column where relevance needs to be calculated.
 * With an optional multiplier.
 */
interface RelevanceColumn {
  name: string;
  weightMultiplier?: number;
}

/**
 * Generates a relevance clause for scoring search results.
 * @param searchTerm The term to search for.
 * @param columns The columns to search in. (including prefixes)
 * @param param The parameter function that generates the placeholder.
 * @param lang The language to search in, if undefined searches ALL languages.
 * @returns The generated clause.
 */
export function generateRelevanceClause(
  searchTerm: string,
  columns: RelevanceColumn[],
  param: (val: any) => string,
  lang?: Language,
): string {
  const val = param(searchTerm);
  const languagesToSearch = lang ? [lang] : SUPPORTED_LANGUAGES;

  // We score each column, finding the BEST language match per column
  const scoringParts = columns.map((column) => {
    const weightMultiplier = column.weightMultiplier ?? 1;

    const langScores = languagesToSearch.map((searchLang) => {
      // Prevents null poisoning.
      const jsonField = `COALESCE(${column.name}->>'${searchLang}', '')`;

      // Calculate a base score for the whole string.
      const baseScore = `word_similarity(${val}, ${jsonField})`;

      // If an exact match big bonus.
      const exactMatchBonus = `(CASE WHEN ${jsonField} ILIKE ${val} THEN 1.5 ELSE 0.0 END)`;

      // And if the start we also give a bonus.
      const startsWithBonus = `(CASE WHEN ${jsonField} ILIKE (CAST(${val} AS text) || '%') THEN 0.5 ELSE 0.0 END)`;

      return `(${baseScore} + ${exactMatchBonus} + ${startsWithBonus})`;
    });

    // GREATEST to take the best language score.
    // Wrap in COALESCE to ensure the column score is never NULL.
    return `(COALESCE(GREATEST(${langScores.join(", ")}), 0) * ${weightMultiplier})`;
  });

  if (scoringParts.length === 0) return "0";
  return scoringParts.join(" + ");
}

/**
 * Executes a query and translates standard database constraints into HTTP exceptions.
 * @throws InvalidReferenceException if one or more of the provided ids are faulty.
 * @throws SystemFailureException if something else goes wrong.
 */
export async function executeWithReferenceCheck<T>(
  queryPromise: Promise<T>,
): Promise<T> {
  try {
    return await queryPromise;
  } catch (error: unknown) {
    const dbError = error as PostgresError;

    // Standardize the 404 translation across your whole app
    if (dbError?.code === "23503") {
      throw new InvalidReferenceException();
    }

    // add extra errors here if desired

    // backup 500 error
    throw SystemFailureException;
  }
}
