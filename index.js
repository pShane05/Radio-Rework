const express = require('express')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
require('dotenv').config()

const PORT = process.env.PORT || 5500

const app = express()

// Rate Limiting 
const limiter = rateLimit({
    windowMs: 10 * 60 * 100,
    max: 100
})
app.use(limiter)
app.set('trust proxy', 1)

// enable cors
app.use(cors())

// Set static folders
app.use(express.static('public'))

//routes
app.use('/api', require('./routes'))


app.listen(PORT, '127.0.0.1', () => console.log(`Server running on port ${PORT}`))
.on('error', (err) => {
    console.error('Server error:', err)
})