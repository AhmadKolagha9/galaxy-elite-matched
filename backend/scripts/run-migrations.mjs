import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import dotenv from 'dotenv'
import mysql from 'mysql2/promise'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const backendRoot = path.resolve(__dirname, '..')
const envResult = dotenv.config({ path: path.join(backendRoot, '.env') })

if (envResult.error && envResult.error.code !== 'ENOENT') {
  throw envResult.error
}

const databaseUrl = process.env.MYSQL_DATABASE_URL || process.env.DATABASE_URL
if (!databaseUrl) {
  console.error('MYSQL_DATABASE_URL or DATABASE_URL is required. Create backend/.env or export a MySQL connection URL before running migrations.')
  process.exit(1)
}

const migrationsDir = path.join(backendRoot, 'db', 'mysql')
const migrationFiles = (await readdir(migrationsDir))
  .filter((file) => file.endsWith('.sql'))
  .sort((a, b) => a.localeCompare(b))

const connection = await mysql.createConnection({ uri: databaseUrl, multipleStatements: true })

try {
  await connection.beginTransaction()
  await connection.query(`
    create table if not exists schema_migrations (
      version varchar(255) primary key,
      applied_at timestamp not null default current_timestamp
    )
  `)

  for (const file of migrationFiles) {
    const [rows] = await connection.query('select 1 from schema_migrations where version = ? limit 1', [file])
    if (Array.isArray(rows) && rows.length) {
      console.log(`skip ${file}`)
      continue
    }

    const sql = await readFile(path.join(migrationsDir, file), 'utf8')
    console.log(`apply ${file}`)
    await connection.query(sql)
    await connection.query('insert into schema_migrations (version) values (?)', [file])
  }

  await connection.commit()
  console.log('mysql migrations complete')
} catch (error) {
  await connection.rollback()
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
} finally {
  await connection.end()
}
