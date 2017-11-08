// NOT USED! TODO: REMOVE
// exchanges
// state

const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var nodeSchema = new Schema({
    nodesList: { type: Schema.Types.ObjectId, ref: 'nodesListSchema' },
    state: { type: String }
});

module.exports = mongoose.model('Node', nodeSchema);
