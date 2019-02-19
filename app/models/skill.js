// app/models/skill.js
var mongoose = require('mongoose'); // our layer between the routes and the database
var findOrCreate = require('mongoose-findorcreate');

var skillSchema = mongoose.Schema({
    name: {type: String, index: true, unique: true}
});

skillSchema.plugin(findOrCreate);

module.exports = mongoose.model('Skill', skillSchema);