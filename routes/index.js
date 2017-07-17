const express = require('express');
const router  = express.Router();
const sequelize = require('sequelize');
const models = require('../models');
const app = require('../server');
const Promise = require("bluebird");
const session = require("express-session");
var crypto =  require("crypto");


// POST - SignUp          : /api/signup
// POST  - Login          : /api/login
// POST - Snippets         : /api/Snippets
// GET - Snippets-language : /api/snippets/langs/:lang
// GET - Snippets - Tags    : /api/snippets/tags/:tag
// GET - Snippets - User specific   : /api/snippets/user/langs/:lang
// GET - Snippets - User specific   : /api/snippets/user/tags/:tag
// GET  - Snippets -User specific  : /api/Snippets/user


/******** POST /signup *************/
  router.post("/api/signup", function(req, res){

  let errors = "";
  let messages = [];

  req.checkBody("username", "Please enter a valid username").notEmpty().isLength({max: 30});
  req.checkBody("password", "Please enter a Password").notEmpty();

  req.getValidationResult().then(function(result){

      if(!result.isEmpty()){
        res.setHeader('Content-Typeorder', 'application/json');
        res.json({status:"failure", data:"No data found"});
      //  res.render("signup",{ errors: result.array(),
                              //sessionExist:req.session.username})
      }
      else{
            var hash_password = hashPassword(req.body.password);

            models.users.create({
              username: req.body.username,
              salt: hash_password.salt,
              hash: hash_password.hash,
              iteration: hash_password.iterations
            }).catch(sequelize.ValidationError, function(err) {
              console.log("Not Valid! ", err);
            }).catch(sequelize.UniqueConstraintError, function(err) {
              console.log("Not Unique! ", err);
            })
            .then(function(user){
              req.session.username = req.body.username;
              req.session.id  = user.id;
              res.setHeader('Content-Typeorder', 'application/json');
              res.json({status:"success", data:user});
              //res.render("login", {sessionExist:req.session.username});
            });
        }
    });
  });


/******** POST / new registration *************/
  router.post('/api/login',function(req, res){

    let errors = "";
    let messages = [];

    req.checkBody("username", "Please enter username").notEmpty();
    req.checkBody("password", "Please enter password").notEmpty();

    req.getValidationResult().then(function(result){
      if(!result.isEmpty()){
        res.setHeader('Content-Typeorder', 'application/json');
        res.json({status:"failure", data:result});
        //res.render("login",{ errors: result.array(),
                              //sessionExist:req.session.username})
      }
      else{
        models.users.findOne({username: req.body.username})
           .then(function(user){
            if(!user)
            {
              res.render ("login", {messages: "User not found"})
            }
            else {
               var config = {
                   keylen: 512,
                   digest: 'sha512'
               };
                  models.users.findOne({
                   where: {username: req.body.username}
                  })
                   .then(function(result){
                   var savedHash = result.hash;
                   var savedSalt = result.salt;
                   var savedIterations = result.iteration;
                   var hash = crypto.pbkdf2Sync(req.body.password, savedSalt, savedIterations, config.keylen, config.digest);
                   var hashedPassword = hash.toString('base64');
                   if(savedHash === hashedPassword){
                     req.session.username = result.username;
                     session.id = result.id;
                     res.setHeader('Content-Typeorder', 'application/json');
                     res.json({status:"success", data:result.username});
                   }
                   else {
                    res.setHeader('Content-Typeorder', 'application/json');
                    res.json({status:"failure", data:"Enter valid username and password"});
                     //res.render("login", {messages: "Enter a valid username and password"});
                 }
                });
              }
          });
        }
      });
  });

/**** GET / Snippets *******/
router.get('/api/snippets', function(req, res) {

  models.snippets.findAll({
    where: {
        userid: {$ne: null}
    },
    include: [{
         model: models.users,
         as: "user_snippets"
       }]
  }).then(function(snippets){
    if(snippets){
      res.setHeader('Content-Typeorder', 'application/json');
      res.json({status:"success", data:snippets});
    }
    else {
      res.setHeader('Content-Typeorder', 'application/json');
      res.json({status:"failure", data:"No records available"});
    }
})
});

/*********** POST /snippets  ************/
router.post('/api/snippets', function(req, res) {
  let errors = "";
  let messages = [];

  req.checkBody("title", "Please enter title").notEmpty().isLength({max: 100});
  req.checkBody("body", "Please enter body").notEmpty();
  req.checkBody("notes", "Please enter notes").notEmpty();
  req.checkBody("language","Please enter language").notEmpty().isLength({max:200});
  req.checkBody("tags","Please enter tags").notEmpty().isLength({max:200});

  errors = req.validationErrors();
  if(errors) {
      errors.forEach(function(error){
        messages.push(error.msg);
    });

    res.setHeader('Content-Typeorder', 'application/json');
    res.json({status:"failure", data:messages});
    //res.render("snippets", {messages: messages,
                          //sessionExist:req.session.username});
  }
  else {
    models.snippets.create({
      userid: 1,  //req.session.id
      title: req.body.title,
      body:req.body.body,
      notes:req.body.notes,
      language: req.body.language,
      tags: [req.body.tags]
    }).catch(sequelize.ValidationError, function(err) {
      console.log("Not Valid! ", err);
    }).catch(sequelize.UniqueConstraintError, function(err) {
      console.log("Not Unique! ", err);
    })
    .then(function(snippets){
      res.setHeader('Content-Typeorder', 'application/json');
      res.status(200).json(snippets);
      //res.render("login", {sessionExist:req.session.username});
    });
  }
});

/***** GET /snippets/lang  ********/
router.get('/api/snippets/langs/:lang', function(req, res) {
  models.snippets.findOne({
    where: {
      language: req.params.lang
    },
    include: [{
         model: models.users,
         as: "user_snippets"
       }]
  }).then(function(snippets){
    if(snippets){
      res.setHeader('Content-Typeorder', 'application/json');
      res.json({status:"success", data:snippets});
    }
    else {
      res.setHeader('Content-Typeorder', 'application/json');
      res.json({status:"failure", data:"No records available"});
    }
})
});

/*********** GET Snippet based on tags ***********/
router.get('/api/snippets/tags/:tag', function(req, res) {
  models.snippets.findAll({
    where: {
      tags: {
        $like: { $any: ['{' + req.params.tag + '}'] }
      }
    },
    include: [{
         model: models.users,
         as: "user_snippets"
       }]
  }).then(function(snippets){
    if(snippets){
      res.setHeader('Content-Typeorder', 'application/json');
      res.json({status:"success", data:snippets});
    }
    else {
      res.setHeader('Content-Typeorder', 'application/json');
      res.json({status:"failure", data:"No records available"});
    }
})
});


/**** GET / Snippets - USER SPECIFIC *******/
router.get('/api/snippets/user', function(req, res) {

  models.snippets.findAll({
    where: {
        userid : 1 //req.session.id
    },
    include: [{
         model: models.users,
         as: "user_snippets"
       }]
  }).then(function(snippets){
    if(snippets){
      res.setHeader('Content-Typeorder', 'application/json');
      res.json({status:"success", data:snippets});
    }
    else {
      res.setHeader('Content-Typeorder', 'application/json');
      res.json({status:"failure", data:"No records available"});
    }
})
});

/***** GET /snippets/lang - USER SPECIFIC ********/
router.get('/api/snippets/user/langs/:lang', function(req, res) {
  models.snippets.findOne({
    where: {
      language: req.params.lang,
      userid: 1 // req.session.id
    },
    include: [{
         model: models.users,
         as: "user_snippets"
       }]
  }).then(function(snippets){
    if(snippets){
      res.setHeader('Content-Typeorder', 'application/json');
      res.json({status:"success", data:snippets});
    }
    else {
      res.setHeader('Content-Typeorder', 'application/json');
      res.json({status:"failure", data:"No records available"});
    }
})
});

/*********** GET Snippet based on tags - USER SPECIFIC  ***********/

router.get('/api/snippets/user/tags/:tag', function(req, res) {
  models.snippets.findAll({
    where: {
      userid: 1, // req.session.id
      tags: {
        $like: { $any: ['{' + req.params.tag + '}'] }
      }
    },
    include: [{
         model: models.users,
         as: "user_snippets"
       }]
  }).then(function(snippets){
    if(snippets){
      res.setHeader('Content-Typeorder', 'application/json');
      res.json({status:"success", data:snippets});
    }
    else {
      res.setHeader('Content-Typeorder', 'application/json');
      res.json({status:"failure", data:"No records available"});
    }
})
});

/*********** For Hash Password :  crypto.pbkdf2Sync ******/

var config = {
  salt: function(length){
    return crypto.randomBytes(Math.ceil(32*3/4)).toString('base64').slice(0, length);
  },
  iterations: 20000,
  keylen: 512,
  digest: 'sha512'
}

function hashPassword(passwordinput){
  var salt = config.salt(32);
  var iterations = config.iterations;
  var hash = crypto.pbkdf2Sync(passwordinput, salt, iterations, config.keylen, config.digest);
  var hashedPassword = hash.toString('base64');

  return {salt: salt, hash: hashedPassword, iterations: iterations};
}

module.exports = router;
