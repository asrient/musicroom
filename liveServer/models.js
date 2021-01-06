var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var message = new Schema({
    type:String,
    date: Date,
    room_id: Number,
    data: Object,
});

var Message = mongoose.model('message', message);

module.exports={Message}