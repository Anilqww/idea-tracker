const express = require('express')
const jwt = require('jsonwebtoken')
const db = require('../database')

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key'

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body
  
  console.log(`[${new Date().toLocaleTimeString()}] Регистрация: ${email}`)
  
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Заполните все поля' })
  }
  
  try {
    const existing = await new Promise((resolve) => {
      db.get('SELECT id FROM users WHERE email = ?', [email], (err, row) => {
        resolve(row)
      })
    })
    
    if (existing) {
      return res.status(400).json({ error: 'Пользователь уже существует' })
    }
    
    const result = await new Promise((resolve) => {
      db.run(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, password, 'user'],
        function(err) {
          resolve({ id: this.lastID, err })
        }
      )
    })
    
    if (result.err) {
      console.log('Ошибка INSERT:', result.err)
      return res.status(500).json({ error: 'Ошибка создания пользователя' })
    }
    
    const userId = result.id
    const token = jwt.sign(
      { id: userId, email, role: 'user' },
      JWT_SECRET,
      { expiresIn: '7d' }
    )
    
    console.log(`[${new Date().toLocaleTimeString()}] Зарегистрирован: ${email}`)
    
    res.json({
      token,
      user: { id: userId, name, email, role: 'user' }
    })
    
  } catch (error) {
    console.error('Ошибка регистрации:', error)
    res.status(500).json({ error: 'Внутренняя ошибка сервера' })
  }
})

router.post('/login', (req, res) => {
  const { email, password } = req.body
  
  console.log(`[${new Date().toLocaleTimeString()}] Попытка входа: ${email}`)
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Заполните все поля' })
  }
  
  db.get(
    'SELECT id, name, email, password, role FROM users WHERE email = ?',
    [email],
    (err, user) => {
      if (err) {
        console.log('Ошибка запроса:', err)
        return res.status(500).json({ error: 'Ошибка сервера' })
      }
      
      if (!user) {
        console.log(`[${new Date().toLocaleTimeString()}] Пользователь не найден: ${email}`)
        return res.status(401).json({ error: 'Неверный email или пароль' })
      }
      
      console.log(`Найден пользователь: ${user.email}, пароль в БД: ${user.password}, введённый пароль: ${password}`)
      
      if (password !== user.password) {
        console.log(`[${new Date().toLocaleTimeString()}] Неверный пароль: ${email}`)
        return res.status(401).json({ error: 'Неверный email или пароль' })
      }
      
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      )
      
      console.log(`[${new Date().toLocaleTimeString()}] Успешный вход: ${email} (${user.role})`)
      
      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      })
    }
  )
})

module.exports = router