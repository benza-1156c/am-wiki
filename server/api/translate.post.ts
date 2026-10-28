const translationCache = new Map<string, string>()

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    if (!body || (!body.text && !body.texts)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid payload: "text" or "texts" required'
      })
    }

    const from = body.from || 'en'
    const to = body.to || 'th'

    async function translateSingle(str: string): Promise<string> {
      if (!str || typeof str !== 'string' || !str.trim()) return str

      const cacheKey = `${from}:${to}:${str.trim()}`
      if (translationCache.has(cacheKey)) {
        return translationCache.get(cacheKey)!
      }

      try {
        const googleUrl = `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=${from}&tl=${to}&q=${encodeURIComponent(str)}`
        const res = await fetch(googleUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        })

        if (res.ok) {
          const data = await res.json()
          let result = ''
          if (Array.isArray(data)) {
            result = data.join('')
          } else if (typeof data === 'string') {
            result = data
          }

          if (result) {
            result = result.replace(/<font>\s*color=/gi, '<font color=')
            translationCache.set(cacheKey, result)
            return result
          }
        }
      } catch {
      }

      try {
        const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(str)}&langpair=${from}|${to}`
        const res = await fetch(myMemoryUrl)
        if (res.ok) {
          const data = await res.json()
          const result = data.responseData?.translatedText
          if (result && !result.includes('QUERY LENGTH LIMIT')) {
            translationCache.set(cacheKey, result)
            return result
          }
        }
      } catch {
      }
      return str
    }

    if (Array.isArray(body.texts)) {
      const results = await Promise.all(body.texts.map((t: string) => translateSingle(t)))
      return { translations: results }
    }

    const translatedText = await translateSingle(body.text)
    return { translatedText }
  } catch (err: any) {
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || err.message || 'Translation failed'
    })
  }
})
