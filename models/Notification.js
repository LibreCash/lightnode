// NOT USED! TODO: REMOVE
// Notification
//  nodeId
//  date
//  code
//  object

const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var notificationSchema = new Schema({
    notificationsList: { type: Schema.Types.ObjectId, ref: 'notificationsListSchema' },
    nodeId: { type: String, required: true },
    date: { type: Date, required: true },
    code: { type: String, required: true },
    object: { type: String }, // todo
});

module.exports = mongoose.model('Notification', notificationSchema);
