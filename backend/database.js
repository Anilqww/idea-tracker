const sqlite3 = require('sqlite3').verbose()
const path = require('path')

const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Ошибка подключения к БД:', err.message)
  } else {
    console.log('Подключено к существующей базе данных')
  }
})

module.exports = db