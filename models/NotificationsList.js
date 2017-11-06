// notifications

const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var notificationsListSchema = new Schema({
    name: { type: String, required: true, unique: true }
});

module.exports = mongoose.model('NotificationsList', notificationsListSchema);
