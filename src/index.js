require('dotenv').config()
const express = require('express')
const connectDB = require('./database/db')

const app = express()

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
