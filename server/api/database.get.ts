import fs from 'node:fs/promises'
import path from 'node:path'
import defaultDb from '../../public/database.json'

export default defineEventHandler(async () => {
  const possiblePaths = [
    path.resolve('/tmp', 'database.json'),
    path.resolve(process.cwd(), 'public/database.json')
  ]

  for (const p of possiblePaths) {
    try {
      const raw = await fs.readFile(p, 'utf8')
      if (raw) return JSON.parse(raw)
    } catch {
    }
  }

  return defaultDb
})
