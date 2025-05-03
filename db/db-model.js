const mongoose = require('mongoose')

const powerlogSchema = new mongoose.Schema({
    timestamp: {type: String, required: true},
    event: {type: String}
})

const Powerlog = mongoose.model('Powerlog', powerlogSchema)

module.exports = Powerlog