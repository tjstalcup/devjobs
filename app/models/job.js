// app/models/job.js
var mongoose = require('mongoose'); // our layer between the routes and the database
var findOrCreate = require('mongoose-findorcreate');

var jobSchema = mongoose.Schema({

  guid: String,
  link: String,
  categories: [String],
  jobTitle: String,
  description: String,
  pubDate: Date,
  updateDate: Date,
  location: String  
    
},{
    usePushEach: true
});

jobSchema.plugin(findOrCreate);

module.exports = mongoose.model('Job', jobSchema);