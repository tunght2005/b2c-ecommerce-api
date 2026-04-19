require('dotenv').config()
const express = require('express')
const connectDB = require('./database/db')

const app = express()

const allowedOrigins = [
  /^http:\/\/localhost:\d+$/,
  /^https:\/\/.+\.onrender\.com$/,
  /^https:\/\/b2c-fe-admin\.onrender\.com$/,
  /^https:\/\/.+\.vercel\.app$/,
  /^https:\/\/b2c-ecommerce-admin\.vercel\.app$/
]

app.use((req, res, next) => {
  const origin = req.headers.origin

  if (!origin || allowedOrigins.some((pattern) => pattern.test(origin))) {
    res.header('Access-Control-Allow-Origin', origin || '*')
    res.header('Vary', 'Origin')
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')

    if (req.method === 'OPTIONS') {
      return res.sendStatus(204)
    }

    return next()
  }

  return res.status(403).json({ message: 'CORS blocked' })
})

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => res.send('API running'))

app.use('/api', require('./routes'))
app.use('/uploads', express.static('uploads'))

const PORT = process.env.PORT || 3000

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
  })
})
