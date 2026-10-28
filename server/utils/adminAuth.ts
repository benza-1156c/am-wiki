import fs from 'node:fs'
import path from 'node:path'

export function getValidAdminPasswords(event?: any): string[] {
  const passwords: string[] = []

  // 1. From Nuxt runtimeConfig
  if (event) {
    try {
      const config = useRuntimeConfig(event)
      if (config.adminPassword) passwords.push(String(config.adminPassword))
    } catch {}
  }

  // 2. From process.env
  if (process.env.ADMIN_PASSWORD) {
    passwords.push(String(process.env.ADMIN_PASSWORD))
  }

  // 3. Dynamically from .env on disk (takes effect immediately without server restart)
  try {
    const envPath = path.resolve(process.cwd(), '.env')
    if (fs.existsSync(envPath)) {
      const raw = fs.readFileSync(envPath, 'utf8')
      const lines = raw.split(/\r?\n/)
      for (const line of lines) {
        const trimmed = line.trim()
        if (trimmed.startsWith('ADMIN_PASSWORD=')) {
          const rawVal = trimmed.replace('ADMIN_PASSWORD=', '').trim()
          passwords.push(rawVal)
          // Strip outer quotes if any
          if ((rawVal.startsWith('"') && rawVal.endsWith('"')) || (rawVal.startsWith("'") && rawVal.endsWith("'"))) {
            passwords.push(rawVal.slice(1, -1))
          }
          // If multiple quoted parts exist (e.g. "pass1"pass2")
          const quoteParts = rawVal.split('"').map(p => p.trim()).filter(Boolean)
          for (const p of quoteParts) {
            passwords.push(p)
          }
        }
      }
    }
  } catch {}

  if (passwords.length === 0) {
    passwords.push('admin')
  }

  return [...new Set(passwords.map(p => p.trim()).filter(Boolean))]
}

export function isPasswordMatch(provided: string, validPasswords: string[]): boolean {
  if (!provided) return false
  const p = provided.trim()
  for (const valid of validPasswords) {
    if (p === valid) return true
    try {
      if (decodeURIComponent(p) === valid) return true
    } catch {}
    try {
      // Handles UTF-8 characters decoded by Node HTTP headers as latin1 (e.g. £ -> Â£)
      if (Buffer.from(p, 'latin1').toString('utf8') === valid) return true
    } catch {}
  }
  return false
}
