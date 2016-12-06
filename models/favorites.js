// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

require('mongoose-currency').loadType(mongoose);

var favoriteSchema = new Schema({
    dishes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dish'
    }],
    postedBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    } 
});

module.exports = mongoose.model('Favorites', favoriteSchema);