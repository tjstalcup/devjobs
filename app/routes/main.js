let User = require('../models/user');
let Job = require('../models/job');
let Skill = require('../models/skill');
let request = require('request');
let parseString = require('xml2js').parseString;


module.exports = function(app, passport) {

  // home page
  app.get('/', function(req, res) {
    // res.status(200).json({message:'Home Page Message'});
    res.render('pages/index',{
      user: req.user
    });
  });

  // show the login form
  app.get('/login', function(req, res) {
    // res.status(200).json({message:'Login Page'});
    res.render('pages/login',{
      user: req.user
    });
  });

  // show the signup form
  app.get('/signup', function(req, res) {
    // res.status(200).json({message:'Signup Page'});
    res.render('pages/signup',{
      user: req.user
    });
  });

  app.get('/myskills', isLoggedIn, function(req, res) {
    // res.status(200).json({message:'Signup Page'});
    let skills;
    Skill.find()
      .then((skillsArray)=>{
        skills = skillsArray;
        return User.findOne({_id:req.user._id}).populate('skills');
      })
      .then((userWithSkills)=>{
        res.render('pages/myskills',{
          user: userWithSkills,
          skills: skills
        });
      })
      .catch(errorHandler);
    
  });

  app.get('/add-skill/:skillid/:userid', isLoggedIn, function(req,res){
    if(req.user._id == req.params.userid){
      User.findOne({_id:req.params.userid})
        .then((user)=>{
          if(user.skills.indexOf(req.params.skillid)<0){ // 0 if first, 1, 2,3, w/e index is. -1 for not found
            user.skills.push(req.params.skillid)
          }
          return user.save();
        })
        .then((updatedUser)=>{
          res.redirect('/myskills');
        })
        .catch(errorHandler);
    } else {
      res.redirect('/');
    }
  })

  app.get('/cleanupskills',(req,res)=>{
    Skill.find().sort('name')
      .then(skills=>{
        skills.forEach(masterSkill=>{
          skills.forEach(secondarySkill=>{
            if(masterSkill.name === secondarySkill.name){
              
            }
          })
        })
        res.send(skills);
      })
      .catch(errorHandler);
  });

  app.get('/dashboard', isLoggedIn, function(req, res) {
    // res.status(200).json({message:'Profile Page',user:req.user});

    Job.find({location:/DC/})
      .then((jobs)=>{
        // each job has skills [{_id,name}]
        // req.user has skills [id,id,id]
        jobs.forEach(job=>{
          let userSkills = 0;
          job.skills.forEach(skill=>{
            if(req.user.skills.indexOf(skill._id)>=0){
              userSkills++;
            }
          });
          job.matchRate = (userSkills/job.skills.length)*100;
          // console.log(job.matchRate);
        });

        jobs = jobs.sort(function(a,b){
          return b.matchRate - a.matchRate;
        });

        res.render('pages/dashboard',{
          user: req.user,
          jobs: jobs
        });
      })
      .catch(errorHandler);

    
  });

  // Temp Routes - just for testing

  app.get('/users', (req,res)=>{
    User.find()
      .then((users)=>res.send(users))
      .catch(errorHandler);
  });

  // Job Routes
  app.get('/jobs', (req,res)=>{
    Job.find()
      .then((jobs)=>res.send(jobs))
      .catch(errorHandler);
  });

  app.get('/job/:id',isLoggedIn,(req,res)=>{
    Job.findOne({_id:req.params.id})
      .then(job=>{
        // req.user.skills[]
        // job.skills[{_id,name}]
        let userSkills = 0;
        job.skills.forEach(skill=>{
          if(req.user.skills.indexOf(skill._id)>=0){
            userSkills++;
          }
        });
        let matchRate = (userSkills/job.skills.length)*100;

        res.render('pages/job',{
          user: req.user,
          job: job,
          matchRate: matchRate
        });
      })
      .catch(errorHandler);
  })

  app.post('/jobs',(req,res)=>{
    // postbody should look like
    // guid, link, categories, jobTitle, description, pubDate, updateDate, location
    normalizeCategories(req.body.categories,(categories)=>{
      req.body.categories = categories;
      req.body.categories.forEach((cat)=>{
        Skill.findOrCreate({name:cat});
      });
      // create job here
      Job.create(req.body)
        .then((job)=>res.send(job))
        .catch(errorHandler);
    });
  });


  // Skill Routes
  app.get('/skills', (req,res)=>{
    Skill.find().sort('name')
      .then((skills)=>res.send(skills))
      .catch(errorHandler);
  });

  app.post('/skills/:id/user/:userID',(req,res)=>{
    // find & findOne
    // User.find({_id:req.params.userID}) user[0].email
    User.findOne({_id:req.params.userID})
      .then((user)=>{
        if(user.skills && user.skills.indexOf(req.params.id)<0){ // indexOf -1 if there is no match
          user.skills.push(req.params.id);
        }
        return user.save();
      })
      .then((newUser)=>{
        res.send(newUser);
      })
      .catch(errorHandler);
  });

  app.get('/call-jobs',(req,res)=>{
    //https://stackoverflow.com/jobs/feed?page=2
    //https://stackoverflow.com/jobs/feed
    request('https://stackoverflow.com/jobs/feed', function (error, response, body) {
      console.log('error:', error); 
      console.log('statusCode:', response && response.statusCode); 
      parseString(body, function (err, result) {
        // res.send(result); 
        // res.send({
        //   "numResults": result.rss.channel[0]['os:totalResults'][0],
        //   "job1Title": result.rss.channel[0].item[0].title
        // });

        let items = result.rss.channel[0].item;
        // let numResults = result.rss.channel[0]['os:totalResults'][0];
        let numResults = 1000;
        let completed = 0;

        items.forEach(function(item,index){
          if(item.hasOwnProperty('category') && index < numResults){

            let numSkills = (item.hasOwnProperty('category')) ? item.category.length : 0;
            let numSkillsCompleted = 0;
            let skills = [];
            
            normalizeCategories(item.category,(categories)=>{
              categories.forEach((cat)=>{
                // Skill.findOrCreate({name:cat})
                // .then((skill)=>{
                //   skills.push(skill.doc._doc._id);
                //   checkSkillsDone();
                // });
                Skill.findOne({name:cat})
                  .then(skill=>{
                    if(skill){
                      skills.push(skill._id);
                      checkSkillsDone();
                    } else {
                      return Skill.create({name:cat});
                    }
                  })
                  .then(skill=>{
                    skills.push(skill._id);
                    checkSkillsDone();
                  });
              });
            });
            
            function checkSkillsDone(){
              numSkillsCompleted++;
              if(numSkillsCompleted == numSkills){
                // guid, link, skills, jobTitle, description, pubDate, updateDate, location
                Job.findOne({
                  guid: item.guid[0]['_']
                })
                  .then(job=>{
                    if(job){
                      checkDone();
                    } else {
                      return Job.create({
                        guid: item.guid[0]['_'],
                        link: item.link[0],
                        skills: skills,
                        jobTitle: item.title[0],
                        description: item.description[0],
                        pubDate: item.pubDate[0],
                        updateDate: item['a10:updated'][0],
                        location: (item.hasOwnProperty('location')) ? item.location[0]['_'] : 'NA'
                      })
                    }
                  })
                  .then((job)=>checkDone())
                  .catch(errorHandler);
              }
            }
          }
          if(index<numResults){
            checkDone();
          }
        });

        function checkDone(){
          completed++;
          if(completed >= numResults){
            res.send(200);
          } else {
            console.log(`Completed ${completed} out of ${numResults}`);
          }
        }

        

      });
    });
  })

};

// middleware to detect login
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
      return next();

  res.redirect('/');
}

// route middleware to make sure a user is logged in as an admin
function isAdmin(req, res, next) {

  // if user is authenticated in the session, carry on 
  if (req.isAuthenticated() && req.user.level == 'admin')
      return next();

  // if they aren't redirect them to the home page
  res.redirect('/');
}

function errorHandler(err){
  console.error(err);
}

function normalizeCategories(categories,cb){
  const acronyms = {"js":"javascript"}
  const removedCharacters = [" ",".","-"];
  
  categories = categories.map((category)=>{
    category = category.toLowerCase();
    if(category.length>2 && category.indexOf('js')>0){ //React JS -> react js -> react, JS -> js -> js
      category = category.replace('js','');
    }
    removedCharacters.forEach((rc)=>{
      category = category.replace(rc,''); // java script -> javascript, node. -> node, java-script -> javascript
    });
    Object.keys(acronyms).forEach((acronym)=>{
      category = category.replace(acronym,acronyms[acronym]); // js -> javascript
    });
    return category;
  });
  cb(categories);
}