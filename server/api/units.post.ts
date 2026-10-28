import fs from 'node:fs/promises'
import path from 'node:path'
import defaultDb from '../../public/database.json'
import { getValidAdminPasswords, isPasswordMatch } from '../utils/adminAuth'

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
    if (!body || typeof body !== 'object') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid payload: JSON object required'
      })
    }

    // Load initial DB from /tmp (if modified on serverless), then public/database.json, then bundled defaultDb
    let currentDb: any = null
    const readPaths = [
      path.resolve('/tmp', 'database.json'),
      path.resolve(process.cwd(), 'public/database.json')
    ]

    for (const p of readPaths) {
      try {
        const rawDb = await fs.readFile(p, 'utf8')
        if (rawDb) {
          currentDb = JSON.parse(rawDb)
          break
        }
      } catch {
        // Continue to next path
      }
    }

    if (!currentDb) {
      // Deep clone default bundled DB
      currentDb = JSON.parse(JSON.stringify(defaultDb))
    }

    if (!Array.isArray(currentDb.units)) currentDb.units = []
    if (!Array.isArray(currentDb.gears)) currentDb.gears = []
    if (!Array.isArray(currentDb.traits)) currentDb.traits = []
    if (!currentDb.skills || typeof currentDb.skills !== 'object') currentDb.skills = {}

    let responseMessage = 'Database updated successfully'

    // Case 1: Single Unit Edit / Create
    if (body.unit && typeof body.unit === 'object') {
      const unit = body.unit
      const idx = currentDb.units.findIndex((u: any) =>
        (unit.id && u.id === unit.id) || (unit.name && u.name === unit.name)
      )
      if (idx !== -1) {
        currentDb.units[idx] = { ...currentDb.units[idx], ...unit }
        responseMessage = `Successfully updated unit "${unit.displayName || unit.name || unit.id}"`
      } else {
        currentDb.units.push(unit)
        responseMessage = `Successfully created new unit "${unit.displayName || unit.name || unit.id}"`
      }
    }
    // Case 2: Delete Single Unit
    else if (body.deleteUnitId) {
      const targetId = String(body.deleteUnitId)
      currentDb.units = currentDb.units.filter((u: any) => u.id !== targetId && u.name !== targetId)
      responseMessage = `Successfully deleted unit "${targetId}"`
    }
    // Case 3: Single Gear Edit / Create
    else if (body.gear && typeof body.gear === 'object') {
      const gear = body.gear
      let idx = typeof body.gearIndex === 'number' && body.gearIndex >= 0 ? body.gearIndex : -1
      if (idx === -1 && gear.Name) {
        idx = currentDb.gears.findIndex((g: any) => g.Name === gear.Name && g.Slot === gear.Slot)
      }
      if (idx !== -1 && idx < currentDb.gears.length) {
        currentDb.gears[idx] = { ...currentDb.gears[idx], ...gear }
        responseMessage = `Successfully updated gear "${gear.Name}"`
      } else {
        currentDb.gears.push(gear)
        responseMessage = `Successfully created gear "${gear.Name}"`
      }
    }
    // Case 4: Delete Single Gear
    else if (typeof body.deleteGearIndex === 'number' && body.deleteGearIndex >= 0) {
      if (body.deleteGearIndex < currentDb.gears.length) {
        const removed = currentDb.gears.splice(body.deleteGearIndex, 1)
        responseMessage = `Successfully deleted gear "${removed[0]?.Name || body.deleteGearIndex}"`
      }
    }
    // Case 5: Single Trait Edit / Create
    else if (body.trait && typeof body.trait === 'object') {
      const trait = body.trait
      let idx = typeof body.traitIndex === 'number' && body.traitIndex >= 0 ? body.traitIndex : -1
      if (idx === -1 && trait.TraitDisplayName) {
        idx = currentDb.traits.findIndex((t: any) => t.TraitDisplayName === trait.TraitDisplayName)
      }
      if (idx !== -1 && idx < currentDb.traits.length) {
        currentDb.traits[idx] = { ...currentDb.traits[idx], ...trait }
        responseMessage = `Successfully updated trait "${trait.TraitDisplayName}"`
      } else {
        currentDb.traits.push(trait)
        responseMessage = `Successfully created trait "${trait.TraitDisplayName}"`
      }
    }
    // Case 6: Delete Single Trait
    else if (typeof body.deleteTraitIndex === 'number' && body.deleteTraitIndex >= 0) {
      if (body.deleteTraitIndex < currentDb.traits.length) {
        const removed = currentDb.traits.splice(body.deleteTraitIndex, 1)
        responseMessage = `Successfully deleted trait "${removed[0]?.TraitDisplayName || body.deleteTraitIndex}"`
      }
    }
    // Case 7: Full Dump JSON Import (Units, Skills, Gears, Traits)
    else if (Array.isArray(body.units)) {
      currentDb.units = body.units
      if (body.skills) currentDb.skills = body.skills
      if (body.gears) currentDb.gears = body.gears
      if (body.traits) currentDb.traits = body.traits
      responseMessage = `Successfully imported ${body.units.length} units to database.json`
    }

    currentDb.meta = {
      ...(currentDb.meta || {}),
      totalUnits: currentDb.units.length,
      updatedAt: new Date().toISOString(),
      version: '2.0.0'
    }

    const jsonString = JSON.stringify(currentDb, null, 2)

    // Save with fallback for serverless read-only filesystem (e.g. Vercel)
    try {
      const localPath = path.resolve(process.cwd(), 'public/database.json')
      await fs.writeFile(localPath, jsonString, 'utf8')
    } catch {
      // Fallback to /tmp in read-only serverless environment
      const tmpPath = path.resolve('/tmp', 'database.json')
      await fs.writeFile(tmpPath, jsonString, 'utf8')
    }

    return {
      success: true,
      totalUnits: currentDb.units.length,
      message: responseMessage,
      db: currentDb
    }
  } catch (err: any) {
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || err.message || 'Failed to update database'
    })
  }
})
