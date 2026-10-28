import fs from 'node:fs/promises'
import path from 'node:path'

export default defineEventHandler(async (event) => {
  const providedKey = getHeader(event, 'x-admin-key') ? String(getHeader(event, 'x-admin-key')).trim() : ''
  const validKeys = getValidAdminPasswords(event)

  if (!providedKey || !isPasswordMatch(providedKey, validKeys)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized: Admin authentication required'
    })
  }

  try {
    const body = await readBody(event)
    if (!body || !Array.isArray(body.units)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid payload: "units" array required'
      })
    }

    const dbPath = path.resolve(process.cwd(), 'public/database.json')
    let currentDb: any = {}

    try {
      const rawDb = await fs.readFile(dbPath, 'utf8')
      currentDb = JSON.parse(rawDb)
    } catch {
      currentDb = { meta: {}, units: [], skills: {}, gears: [], traits: [] }
    }

    currentDb.units = body.units
    if (body.skills) currentDb.skills = body.skills
    if (body.gears) currentDb.gears = body.gears
    if (body.traits) currentDb.traits = body.traits

    currentDb.meta = {
      ...(currentDb.meta || {}),
      totalUnits: body.units.length,
      updatedAt: new Date().toISOString(),
      version: '2.0.0'
    }

    await fs.writeFile(dbPath, JSON.stringify(currentDb, null, 2), 'utf8')

    return {
      success: true,
      totalUnits: body.units.length,
      message: `Successfully saved ${body.units.length} units to database.json`
    }
  } catch (err: any) {
    throw createError({
      statusCode: 500,
      statusMessage: err.message || 'Failed to save units'
    })
  }
})
