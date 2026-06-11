
const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key'

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log(`🔒 [${new Date().toLocaleTimeString()}] Нет токена: ${req.method} ${req.url}`)
    return res.status(401).json({ error: 'Требуется авторизация' })
  }
  
  const token = authHeader.split(' ')[1]
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    console.log(`[${new Date().toLocaleTimeString()}] Авторизован: ${decoded.email} (${decoded.role})`)
    next()
  } catch (error) {
    console.log(`[${new Date().toLocaleTimeString()}] Неверный токен: ${error.message}`)
    return res.status(403).json({ error: 'Неверный или просроченный токен' })
  }
}

module.exports = { authenticate }