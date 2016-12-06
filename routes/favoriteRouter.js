var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var Favorites = require('../models/favorites');

var Verify = require('./verify');

var favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

//"/dishes"
favoriteRouter.route('/')
//first verification is done, and then if verified proceed forward
.get(Verify.verifyOrdinaryUser, function (req, res, next) {
    req.body.postedBy = req.decoded._id;
    
    Favorites.findOne({'postedBy': req.body.postedBy})
        .populate('dishes')
        .populate('postedBy')
        .exec(function (err, favDish) {
                if (err) next(err);
                res.json(favDish);
    });
})

.post(Verify.verifyOrdinaryUser, function (req, res, next) {
//    var id = mongoose.Schema.Types.ObjectId(req.body._id);
    req.body.postedBy = req.decoded._id;
    
    Favorites.findOne({'postedBy': req.body.postedBy}, function (err, favDish) {
        
        
        if (err) {next(err);}
        
        else if(!err && favDish !== null){
            if(favDish.dishes.indexOf(req.body._id) === -1){
                favDish.dishes.push(req.body._id);
                favDish.save(function (err, favDish) {
                    if (err) next(err);
                    res.json(favDish);
                });
            }else{
                res.json('Dish already exists in your favorites list!!!');
            }
        }
        
        else {
            var newUser = new Favorites({dishes: [req.body._id], postedBy: req.body.postedBy});
        
            newUser.save(function(err, newUser){
                if(err) next(err);
                console.log("Created new user's favorite list!");
                res.json(newUser);
            });
        }
        
        
    });
})

.delete(Verify.verifyOrdinaryUser, function (req, res, next) {
    req.body.postedBy = req.decoded._id;
    
    Favorites.findOneAndUpdate({'postedBy': req.body.postedBy}, {$set: {dishes: []}}, function(err, resp) {
        if (err) next(err);
        console.log('Deleted the favorite list!');
        res.json(resp);
    });
});

favoriteRouter.route('/:dishId')

.delete(Verify.verifyOrdinaryUser, function (req, res, next) {
    req.body.postedBy = req.decoded._id;
    
    Favorites.findOneAndUpdate({'postedBy': req.body.postedBy}, {$pull: {dishes: req.params.dishId}}, function(err, resp){
        if (err) next(err);
        console.log('Deleted the favorite dish!');
        res.json(resp);
    });
});



module.exports = favoriteRouter;
