let User = require('../models/user');
let Job = require('../models/job');
let Skill = require('../models/skill');


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

  app.get('/dashboard', isLoggedIn, function(req, res) {
    // res.status(200).json({message:'Profile Page',user:req.user});

    Job.find()
      .then((jobs)=>{
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
    Skill.find()
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