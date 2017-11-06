const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var lightNodeStateSchema = new Schema({
    startTime: { type: Date, required: true },
    uptime: { type: Date, required: true },
    lastUpdate: { type: Date, required: true }
});

module.exports = mongoose.model('LightNodeState', lightNodeStateSchema);
