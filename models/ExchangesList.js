// NOT USED! TODO: REMOVE
// exchanges list with ExchangesListItem
// WARNING! ExchangesListItem is not Exchange!!!

const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var exchangesListSchema = new Schema({
    name: { type: String, required: true, unique: true }
});

module.exports = mongoose.model('ExchangesList', exchangesListSchema);
