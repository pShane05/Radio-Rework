const express = require('express')
const cors = require('cors')
require('dotenv').config()

const PORT = process.env.PORT || 5000

const app = express()

// set static folder
app.use(express.static('public'))

//routes
app.use('/api', require('./Radio-Rework/routes'))

// enable cors
app.use(cors())

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
.on('error', (err) => {
    console.error('Server error:', err)
})