// app/models/job.js
var mongoose = require('mongoose'); // our layer between the routes and the database
var findOrCreate = require('mongoose-findorcreate');

var jobSchema = mongoose.Schema({

  guid: String,
  link: String,
  skills: [{type: mongoose.Schema.Types.ObjectId, ref: 'Skill'}],
  jobTitle: String,
  description: String,
  pubDate: Date,
  updateDate: Date,
  location: String  
    
},{
    usePushEach: true
});

jobSchema.pre('find',function(next){
  this.populate('skills');
  next();
});

jobSchema.pre('findOne',function(next){
  this.populate('skills');
  next();
});

jobSchema.plugin(findOrCreate);

module.exports = mongoose.model('Job', jobSchema);