import { randomUUID } from "node:crypto";

import type { PoolConnection, RowDataPacket } from "mysql2/promise";

import { getMySqlPool } from "./mysql.js";

type QueryRows<T> = T[] & RowDataPacket[];

export type QueryResult<T = Record<string, unknown>> = {
  rows: T[];
  rowCount: number;
};

export type Queryable = {
  query: <T = Record<string, unknown>>(sql: string, params?: readonly unknown[]) => Promise<QueryResult<T>>;
};

const normalizeSql = (sql: string) =>
  sql
    .replace(/public\./g, "")
    .replace(/\$(\d+)/g, "?")
    .replace(/::text/g, "")
    .replace(/\s+nulls\s+first/gi, "")
    .replace(/\bnow\(\)/gi, "current_timestamp");

const splitReturning = (sql: string) => {
  const match = sql.match(/\s+returning\s+([\s\S]+)$/i);
  if (!match?.index) return { sql, returning: undefined };
  return { sql: sql.slice(0, match.index), returning: match[1].trim() };
};

const firstTableFromInsert = (sql: string) => sql.match(/^\s*insert\s+into\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)/i);
const firstTableFromUpdate = (sql: string) => sql.match(/^\s*update\s+([a-zA-Z0-9_]+)\s+set\s+/i);

const runRaw = async <T>(connection: PoolConnection | undefined, sql: string, params: readonly unknown[]) => {
  const executor = connection ?? getMySqlPool();
  const [result] = await executor.query(sql, [...params]);
  if (Array.isArray(result)) {
    const rows = result as QueryRows<T>;
    return { rows: rows as T[], rowCount: rows.length } satisfies QueryResult<T>;
  }
  return { rows: [], rowCount: Number((result as { affectedRows?: number }).affectedRows ?? 0) } satisfies QueryResult<T>;
};

const selectById = async <T>(connection: PoolConnection | undefined, table: string, returning: string, id: string) => {
  const columns = returning === "*" ? "*" : returning;
  return runRaw<T>(connection, `select ${columns} from ${table} where id = ? limit 1`, [id]);
};

const execute = async <T>(connection: PoolConnection | undefined, rawSql: string, rawParams: readonly unknown[] = []) => {
  const { sql: withoutReturning, returning } = splitReturning(normalizeSql(rawSql));
  let sql = withoutReturning.trim();
  let params = [...rawParams];

  if (!returning) return runRaw<T>(connection, sql, params);

  const insert = firstTableFromInsert(sql);
  if (insert) {
    const [, table, rawColumns] = insert;
    const columns = rawColumns.split(",").map((column) => column.trim().replace(/`/g, ""));
    let id = params[columns.indexOf("id")];
    if (!id) {
      id = randomUUID();
      sql = sql.replace(`(${rawColumns})`, `(id, ${rawColumns})`).replace(/values\s*\(/i, "values (?, ");
      params = [id, ...params];
    }
    await runRaw(connection, sql, params);
    return selectById<T>(connection, table, returning, String(id));
  }

  const update = firstTableFromUpdate(sql);
  if (update) {
    const table = update[1];
    const id = params[params.length - 1];
    await runRaw(connection, sql, params);
    return selectById<T>(connection, table, returning, String(id));
  }

  return runRaw<T>(connection, sql, params);
};

export const query = <T = Record<string, unknown>>(sql: string, params: readonly unknown[] = []) => execute<T>(undefined, sql, params);

export const withTransaction = async <T>(callback: (client: Queryable) => Promise<T>) => {
  const connection = await getMySqlPool().getConnection();
  const client: Queryable = { query: (sql, params = []) => execute(connection, sql, params) };

  try {
    await connection.beginTransaction();
    const result = await callback(client);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

