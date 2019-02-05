const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const should = chai.should();

const configDB = require('../config/database.js');
const User = require('../app/models/user');
const {app, runServer, closeServer} = require('../server');

chai.use(chaiHttp);

function tearDownDb(){
  return new Promise((resolve,reject)=>{
    console.warn('---Deleting Database---');
    User.collection.drop()
      .then( res => resolve(res))
      .catch( err => reject(err));
  });
}

function seedDatabase(){
  return seedUsers();
}

function seedUsers(){
  console.info('--- Seeding Users ---');
  const seedData = [];
  for(let i=0; i < 5; i++){
    seedData.push({
      "local.email" : faker.internet.email(),
      "local.password" : faker.internet.password()
    });
  }
  return User.insertMany(seedData);
}

describe('DevJobs User Tests', function(){

  before(function(){
    return runServer(configDB.testurl,8081);
  });

  after(function(){
    return closeServer();
  });

  beforeEach(function(){
    return seedDatabase();
  });

  afterEach(function(){
    //return true;
    return tearDownDb();
  });

  describe('GET endpoints',function(){

    it('should get all users',function(){
      let users;

      return User.find()
        .then(allUsers => {
          users = allUsers;
          console.log(users.length);
          return chai.request(app).get('/users');
        })
        .then ( res => {
          res.should.have.status(200);
          // existence, datatype, value
          res.should.be.json;
          res.body.should.be.a('array');
          res.body.should.have.lengthOf.at.least(5);
          res.body.forEach((user,index)=>{
            user.should.be.a('object');
            user.should.include.keys('local','_id','skills');
            user.local.email.should.equal(users[index].local.email);
          });
        });
    });

    it('should get no jobs',function(){
      chai.request(app).get('/jobs')
        .then(res=>{
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('array');
          res.body.should.have.lengthOf.at.least(0);
        });
    });

  });

});

// describe('POST endpoints',function(){
//   it('should register a new user',function(){
//     let newUser = {
//       "email":'testuser@test.com',
//       "password":'test'
//     };

//     chai.request(app).post('/signup').send(newUser)
//       .then(res => {
//         console.log(res.body);
//       });
//   })
// })