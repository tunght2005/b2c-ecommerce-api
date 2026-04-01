const mysql = require('mysql2/promise')

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

// Test kết nối khi khởi động
;(async () => {
  try {
    const conn = await db.getConnection()
    console.log('MySQL connected successfully')
    conn.release()
  } catch (err) {
    console.error('MySQL connection failed:', err.message)
    process.exit(1)
  }
})()

module.exports = db
