var express = require('express');
var router = express.Router();
var passport = require('passport');
var bodyParser = require('body-parser');

var User = require('../models/user');
var Verify = require('./verify');

router.use(bodyParser.json());

/* GET users listing. */
router.route('/')
.get(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function(req, res, next) {
    User.find({}, function (err, user) {
        if (err) next(err);
        res.json(user);
    });
});

//user registration
router.post('/register', function(req, res){
   User.register(new User({username: req.body.username}), req.body.password, function(err, user){
      if(err){
          return res.status(500).json({err: err});
      }
       
       if(req.body.firstname){
           user.firstname = req.body.firstname;
       }
       
       if(req.body.lastname){
           user.lastname = req.body.lastname;
       }
      user.save(function(err, user){
          passport.authenticate('local')(req, res, function(){
             return res.status(200).json({status: 'Registration Successful!'}); 
          }); 
      });
   }); 
});

//login user
router.post('/login', function(req, res, next){
    //An optional info argument will be passed, containing additional details provided by the strategy's verify callback.
   passport.authenticate('local', function(err, user, info){
       if(err){
           return next(err);
       }
       if(!user){
           return res.status(401).json({
               err: info
           });
       }
       //user will be assigned to req.user if login completes
       req.login(user, function(err){
           if(err){
               return res.status(500).json({
                   err: 'Could not log in user'
               });
           }
           
           console.log('User in users: ', user);
           
           var token = Verify.getToken({"username":user.username, "_id":user._id, "admin":user.admin});
           
           res.status(200).json({
               status: 'Login successful!',
               success: true,
               token: token
           });
       });
   })(req, res, next);//on success req.user contains the authenticated user
});

router.post('/logout', function(req, res){
    //removes the req.user property and clear the login session
    req.logout();
    res.status(200).json({
        status: 'Bye!'
    });
});

router.get('/facebook', passport.authenticate('facebook'), function(req, res){});

router.get('/facebook/callback', function(req, res, next){
    passport.authenticate('facebook', function(err, user, info){
        if(err){
            return next(err);
        }
        if(!user){
            return res.status(401).json({
                err: info
            });
        }
        req.logIn(user, function(err){
            if(err){
                return res.status(500).json({
                    err: 'Could not log in user'
                });
            }
            
            var token = Verify.getToken({"username":user.username, "_id":user._id, "admin":user.admin});
            
            res.status(200).json({
                status: 'Login successful',
                success: true,
                token: token
            });
        });
    })(req, res, next);
});

module.exports = router;
