// NOT USED! TODO: REMOVE
const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var exchangeSchema = new Schema({
    name: { type: String, required: true, unique: true },
});

module.exports = mongoose.model('Exchange', exchangeSchema);
