const express = require('express')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
require('dotenv').config()

const PORT = process.env.PORT || 5500

const app = express()

// Rate limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 100
})
app.use(limiter)
app.set('trust proxy', 1)

// set static folder
app.use(express.static('public'))

//routes
app.get('/api', (req, res) => {
    res.json({ success: true });
})

// enable cors
app.use(cors())

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
.on('error', (err) => {
    console.error('Server error:', err)
})