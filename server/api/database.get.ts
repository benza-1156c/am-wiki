import fs from 'node:fs/promises'
import path from 'node:path'

export default defineEventHandler(async () => {
  const dbPath = path.resolve(process.cwd(), 'public/database.json')
  try {
    const raw = await fs.readFile(dbPath, 'utf8')
    return JSON.parse(raw)
  } catch (err: any) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to read database.json: ${err.message}`
    })
  }
})
