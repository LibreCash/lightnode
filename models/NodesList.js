// nodes


const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var nodesListSchema = new Schema({
    name: { type: String, required: true, unique: true },
    apiKey: { type: String, required: true }
});

module.exports = mongoose.model('NodesList', nodesListSchema);
