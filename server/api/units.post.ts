import fs from 'node:fs/promises'
import path from 'node:path'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    if (!body || !Array.isArray(body.units)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid payload: "units" array required'
      })
    }

    const unitsPath = path.resolve(process.cwd(), 'public/units.json')
    const dbPath = path.resolve(process.cwd(), 'public/database.json')

    await fs.writeFile(unitsPath, JSON.stringify(body.units, null, 2), 'utf8')

    // Also update public/database.json if it exists
    try {
      const rawDb = await fs.readFile(dbPath, 'utf8')
      const db = JSON.parse(rawDb)
      db.units = body.units
      if (db.meta) {
        db.meta.totalUnits = body.units.length
      }
      await fs.writeFile(dbPath, JSON.stringify(db, null, 2), 'utf8')
    } catch {
      // Ignore database.json sync errors if not present
    }

    return {
      success: true,
      totalUnits: body.units.length,
      message: `Successfully saved ${body.units.length} units to database`
    }
  } catch (err: any) {
    throw createError({
      statusCode: 500,
      statusMessage: err.message || 'Failed to save units'
    })
  }
})
