const express = require('express')
const db = require('../database')
const { authenticate } = require('../middleware/auth')

const router = express.Router()

router.get('/', (req, res) => {
  const { status } = req.query
  
  let sql = "SELECT * FROM ideas"
  const params = []
  
  if (status && status !== 'all') {
    sql += " WHERE status = ?"
    params.push(status)
  }
  
  sql += " ORDER BY votes DESC, created_at DESC"
  
  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка загрузки идей' })
    }
    res.json(rows)
  })
})

router.get('/my', authenticate, (req, res) => {
  const userId = req.user.id
  const isAdmin = req.user.role === 'admin'
  
  if (isAdmin) {
    db.all('SELECT * FROM ideas ORDER BY created_at DESC', [], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка загрузки идей' })
      }
      res.json(rows)
    })
  } else {
    db.all('SELECT * FROM ideas WHERE user_id = ? ORDER BY created_at DESC', [userId], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка загрузки идей' })
      }
      res.json(rows)
    })
  }
})

router.post('/', authenticate, (req, res) => {
  const { title, description } = req.body
  const userId = req.user.id
  const isAdmin = req.user.role === 'admin'
  
  if (!title || !description) {
    return res.status(400).json({ error: 'Заполните заголовок и описание' })
  }
  
  let status = 'idea'
  if (isAdmin && req.body.status) {
    status = req.body.status
  }
  
  db.run(
    'INSERT INTO ideas (title, description, user_id, status) VALUES (?, ?, ?, ?)',
    [title.trim(), description.trim(), userId, status],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Ошибка создания идеи' })
      }
      
      db.get('SELECT * FROM ideas WHERE id = ?', [this.lastID], (err, idea) => {
        if (err) {
          return res.status(500).json({ error: 'Ошибка получения идеи' })
        }
        res.status(201).json(idea)
      })
    }
  )
})

router.put('/:id', authenticate, (req, res) => {
  const { title, description, status } = req.body
  const ideaId = req.params.id
  const userId = req.user.id
  const isAdmin = req.user.role === 'admin'
  
  db.get('SELECT * FROM ideas WHERE id = ?', [ideaId], (err, idea) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка базы данных' })
    }
    
    if (!idea) {
      return res.status(404).json({ error: 'Идея не найдена' })
    }
    
    if (idea.user_id !== userId && !isAdmin) {
      return res.status(403).json({ error: 'Нет прав на редактирование' })
    }
    
    if (isAdmin && status) {
      db.run(
        'UPDATE ideas SET title = ?, description = ?, status = ? WHERE id = ?',
        [title, description, status, ideaId],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Ошибка обновления' })
          }
          res.json({ success: true })
        }
      )
    } else {
      db.run(
        'UPDATE ideas SET title = ?, description = ? WHERE id = ?',
        [title, description, ideaId],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Ошибка обновления' })
          }
          res.json({ success: true })
        }
      )
    }
  })
})

router.delete('/:id', authenticate, (req, res) => {
  const ideaId = req.params.id
  const userId = req.user.id
  const isAdmin = req.user.role === 'admin'
  
  db.get('SELECT user_id FROM ideas WHERE id = ?', [ideaId], (err, idea) => {
    if (err || !idea) {
      return res.status(404).json({ error: 'Идея не найдена' })
    }
    
    if (idea.user_id !== userId && !isAdmin) {
      return res.status(403).json({ error: 'Нет прав на удаление' })
    }
    
    db.run('DELETE FROM votes WHERE idea_id = ?', [ideaId])
    db.run('DELETE FROM ideas WHERE id = ?', [ideaId], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Ошибка удаления' })
      }
      res.json({ success: true })
    })
  })
})

module.exports = router