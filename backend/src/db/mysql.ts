import mysql, { type PoolConnection, type ResultSetHeader, type RowDataPacket } from "mysql2/promise";

import { env } from "../config/env.js";
import { serviceUnavailable } from "../http/errors.js";

let pool: mysql.Pool | undefined;

export const getMySqlPool = () => {
  const uri = env.mysqlDatabaseUrl ?? env.databaseUrl;
  if (!uri) {
    throw serviceUnavailable("MYSQL_DATABASE_URL or DATABASE_URL is required for MySQL-backed API routes.");
  }

  pool ??= mysql.createPool({
    uri,
    waitForConnections: true,
    connectionLimit: 10,
    namedPlaceholders: false,
    decimalNumbers: true,
    dateStrings: false
  });

  return pool;
};

type MySqlExecutor = mysql.Pool | PoolConnection;
export type MySqlConnection = PoolConnection;

export const mysqlExecute = async <T extends RowDataPacket[] | ResultSetHeader = RowDataPacket[]>(
  sql: string,
  params: readonly unknown[] = [],
  executor: MySqlExecutor = getMySqlPool()
) => {
  const [result] = await executor.execute<T>(sql, [...params] as never[]);
  return result;
};

export const withMySqlTransaction = async <T>(callback: (connection: MySqlConnection) => Promise<T>) => {
  const connection = await getMySqlPool().getConnection();

  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

