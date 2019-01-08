// app/models/user.js
var mongoose = require('mongoose'); // our layer between the routes and the database
var bcrypt   = require('bcrypt-nodejs'); // encrypting our password

var userSchema = mongoose.Schema({

    local            : {
        email        : String,
        password     : String,
    },
    linkedinId: String
    // more coming soon w/ LinkedIn
});

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);