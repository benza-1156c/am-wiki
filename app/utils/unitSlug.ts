/**
 * Unit Slug & Route Parameter Utilities
 */

export function toUnitSlug(unit: { id?: string; displayName?: string; name?: string } | string | null | undefined): string {
  if (!unit) return ''
  const obj = typeof unit === 'object' ? unit : { id: unit, displayName: unit, name: unit }
  const raw = obj.displayName || obj.name || obj.id || ''

  let clean = raw
    .toLowerCase()
    .trim()
    .replace(/[()]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  // Disambiguate evolution/awakened units that share the same base name
  if (
    obj.id?.endsWith('_evo') &&
    !clean.includes('evo') &&
    !clean.includes('awakened') &&
    !clean.includes('vampire') &&
    !clean.includes('progenitor')
  ) {
    clean += '-awakened'
  }

  return clean || obj.id?.toLowerCase() || 'unit'
}

export function findUnitByParam(units: any[], param: string | string[] | undefined): any {
  if (!param || !Array.isArray(units)) return null
  const paramStr = Array.isArray(param) ? param[0] : param
  const decoded = decodeURIComponent(String(paramStr)).trim()
  const cleanParam = decoded.toLowerCase()
  const slugParam = toUnitSlug(decoded)

  // 1. Direct ID match (e.g. Alucard_001_evo)
  let found = units.find(u => u.id?.toLowerCase() === cleanParam)
  if (found) return found

  // 2. Exact slug match (e.g. dracula-vampire-progenitor or ashura-awakened)
  found = units.find(u => toUnitSlug(u) === cleanParam || toUnitSlug(u) === slugParam)
  if (found) return found

  // 3. Name or displayName exact match
  found = units.find(
    u => (u.displayName || '').toLowerCase() === cleanParam || (u.name || '').toLowerCase() === cleanParam
  )
  if (found) return found

  // 4. Fallback: contains match
  found = units.find(
    u =>
      (u.displayName && u.displayName.toLowerCase().includes(cleanParam)) ||
      (u.name && u.name.toLowerCase().includes(cleanParam)) ||
      (u.id && u.id.toLowerCase().includes(cleanParam))
  )
  return found || null
}

export function getUnitPath(unit: any): string {
  return `/units/${toUnitSlug(unit)}`
}

