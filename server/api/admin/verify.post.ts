export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const password = body?.password

  const config = useRuntimeConfig(event)
  const serverPassword = config.adminPassword || process.env.ADMIN_PASSWORD || 'admin'

  if (!password || password !== serverPassword) {
    throw createError({
      statusCode: 401,
    })
  }

  return {
    success: true,
  }
})
