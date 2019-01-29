// app/models/user.js
var mongoose = require('mongoose'); // our layer between the routes and the database
var bcrypt   = require('bcrypt-nodejs'); // encrypting our password
var findOrCreate = require('mongoose-findorcreate');

var userSchema = mongoose.Schema({

    local            : {
        email        : String,
        password     : String,
    },
    linkedinId: String,
    // more coming soon w/ LinkedIn
    skills: [{type: mongoose.Schema.Types.ObjectId, ref: 'Skill'}]
    
},{
    usePushEach: true
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

userSchema.pre('find',function(next){
    this.populate('skills');
    next();
});

userSchema.pre('findOne',function(next){
    this.populate('skills');
    next();
});


userSchema.plugin(findOrCreate);

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);