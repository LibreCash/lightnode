// ExchangesListItem
//  nodeId
//  clientId
//  tickets[]:Ticker

const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var exchangesListItemSchema = new Schema({
    exchangesList: { type: Schema.Types.ObjectId, ref: 'exchangesListSchema' },
    nodeId: { type: String, required: true, unique: true },
    clientId: { type: String }
});

module.exports = mongoose.model('ExchangesListItem', exchangesListItemSchema);
