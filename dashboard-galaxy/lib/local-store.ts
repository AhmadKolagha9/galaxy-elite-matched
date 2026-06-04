import { promises as fs } from 'fs'
import path from 'path'

const dataDir = path.join(process.cwd(), '.data')

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

async function ensureDir() {
  await fs.mkdir(dataDir, { recursive: true })
}

export async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    await ensureDir()
    const fullPath = path.join(dataDir, file)
    const raw = await fs.readFile(fullPath, 'utf8')
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export async function writeJson<T extends JsonValue>(file: string, data: T): Promise<void> {
  await ensureDir()
  const fullPath = path.join(dataDir, file)
  await fs.writeFile(fullPath, JSON.stringify(data, null, 2), 'utf8')
}

export async function appendJsonItem<T extends JsonValue>(file: string, item: T): Promise<void> {
  const existing = await readJson<T[]>(file, [])
  existing.unshift(item)
  await writeJson(file, existing as unknown as JsonValue)
}
