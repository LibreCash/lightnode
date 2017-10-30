const mongoose = require('mongoose')
var Schema = mongoose.Schema

var coinSchema = new Schema({
    exchange: { type: Schema.Types.ObjectId, ref: 'coinSchema' },
    mid: { type: Number, required: true },
    low: { type: Number, required: true },
    high: { type: Number, required: true },
    volume: { type: Number, required: true },
    timestamp: { type: Date, required: true }
})

module.exports = mongoose.model('Coin', coinSchema)
