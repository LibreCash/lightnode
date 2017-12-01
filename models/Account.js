const 
    mongoose = require('mongoose'),
    passportLocalMongoose = require('passport-local-mongoose');

var Schema = mongoose.Schema;

/** @title Schema Account for remote incoming connection from masternodes using passport
 * @param username String
 * @param password String
 */

var accountSchema = new Schema({
    username: String,
    password: String
});

accountSchema.plugin(passportLocalMongoose);

/**
 * @title Create model Account
 * @param conn mongoose connection
 */

module.exports.createModel = conn => {
    return conn.model('Account', accountSchema);
}
