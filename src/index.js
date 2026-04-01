require('dotenv').config()
const express = require('express')
require('./database/db')

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api', require('./routes'))

app.get('/', (req, res) => {
  res.send('API running')
})

const PORT = 3000

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
