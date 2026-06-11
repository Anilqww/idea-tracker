
const express = require('express')
const db = require('../database')
const { authenticate } = require('../middleware/auth')

const router = express.Router()

router.get('/my', authenticate, (req, res) => {
  const userId = req.user.id
  
  db.all(
    'SELECT idea_id FROM votes WHERE user_id = ?',
    [userId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка загрузки голосов' })
      }
      const ideaIds = rows.map(row => row.idea_id)
      res.json(ideaIds)
    }
  )
})

router.post('/', authenticate, (req, res) => {
  const { ideaId } = req.body
  const userId = req.user.id
  
  console.log(` [${new Date().toLocaleTimeString()}] Голос: user ${userId} за идею ${ideaId}`)
  
  db.get(
    'SELECT id FROM votes WHERE user_id = ? AND idea_id = ?',
    [userId, ideaId],
    (err, existing) => {
      if (existing) {
        return res.status(400).json({ error: 'Вы уже голосовали' })
      }
      
      db.run(
        'INSERT INTO votes (user_id, idea_id) VALUES (?, ?)',
        [userId, ideaId],
        (err) => {
          if (err) {
            return res.status(500).json({ error: 'Ошибка голосования' })
          }
          
          db.run(
            'UPDATE ideas SET votes = votes + 1 WHERE id = ?',
            [ideaId],
            (err) => {
              if (err) {
                return res.status(500).json({ error: 'Ошибка обновления счётчика' })
              }
              
              console.log(`[${new Date().toLocaleTimeString()}] Голос за идею ${ideaId} учтён`)
              res.json({ success: true })
            }
          )
        }
      )
    }
  )
})

router.delete('/', authenticate, (req, res) => {
  const { ideaId } = req.body
  const userId = req.user.id
  
  console.log(`👎 [${new Date().toLocaleTimeString()}] Отмена голоса: user ${userId} за идею ${ideaId}`)
  
  db.run(
    'DELETE FROM votes WHERE user_id = ? AND idea_id = ?',
    [userId, ideaId],
    function(err) {
      if (err || this.changes === 0) {
        return res.status(400).json({ error: 'Голос не найден' })
      }
      
      db.run(
        'UPDATE ideas SET votes = votes - 1 WHERE id = ?',
        [ideaId],
        (err) => {
          if (err) {
            return res.status(500).json({ error: 'Ошибка обновления счётчика' })
          }
          
          console.log(`[${new Date().toLocaleTimeString()}] Голос за идею ${ideaId} отменён`)
          res.json({ success: true })
        }
      )
    }
  )
})

module.exports = router