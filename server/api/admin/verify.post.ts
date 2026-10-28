export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const password = body?.password ? String(body.password).trim() : ''

  if (!password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Password is required'
    })
  }

  const validPasswords = getValidAdminPasswords(event)
  const matched = isPasswordMatch(password, validPasswords)

  if (!matched) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid administrator password'
    })
  }

  return {
    success: true,
    message: 'Authenticated successfully'
  }
})
