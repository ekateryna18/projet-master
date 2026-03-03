const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'TP2 IoT App' })
})

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' })
})

if (require.main === module) {
  app.listen(PORT, () => console.log(`Running on port ${PORT}`))
}

module.exports = app
