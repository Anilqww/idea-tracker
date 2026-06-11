require('dotenv').config()
const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const fs = require('fs')

const app = express()

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key'

const logStream = fs.createWriteStream('./logs.txt', { flags: 'a' })

function getUserFromToken(req) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return 'guest'
  }
  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    return decoded.email
  } catch {
    return 'guest'
  }
}

app.use((req, res, next) => {
  const start = Date.now()
  const userEmail = getUserFromToken(req)
  
  res.on('finish', () => {
    const duration = Date.now() - start
    const logMessage = `[${new Date().toLocaleTimeString()}] ${userEmail} | ${req.method} ${req.url} | ${res.statusCode} | ${duration}ms\n`
    
    console.log(logMessage)
    logStream.write(logMessage)
  })
  
  next()
})

app.use(cors())
app.use(express.json())

const db = require('./database')

app.use('/api/auth', require('./routes/auth'))
app.use('/api/ideas', require('./routes/ideas'))
app.use('/api/votes', require('./routes/votes'))

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`\nСервер запущен на http://localhost:${PORT}`)
  console.log(`Логи сохраняются в файл: logs.txt`)
})