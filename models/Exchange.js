const mongoose = require('mongoose')
var Schema = mongoose.Schema

// create a schema
var exchangeSchema = new Schema({
    name: { type: String, required: true, unique: true },
})

module.exports = mongoose.model('Exchange', exchangeSchema)
