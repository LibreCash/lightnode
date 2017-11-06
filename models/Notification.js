// Notification
//  nodeId
//  date
//  code
//  object

const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var notificationSchema = new Schema({
    nodesList: { type: Schema.Types.ObjectId, ref: 'notificationsSchema' },
    nodeId: { type: String, required: true },
    date: { type: Date, required: true },
    code: { type: String, required: true },
    object: { type: String, required: true }, // todo
});

module.exports = mongoose.model('Node', nodeSchema);
