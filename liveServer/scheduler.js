require('dotenv').config()
const EventEmitter = require('events');
const { api } = require('./shared.js');
var redis = require('redis');
var mongoose = require('mongoose');
var { Message } = require('./models');

var tunnel = redis.createClient(process.env.REDIS_URL);

mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/mr', { useNewUrlParser: true });

tunnel.on("error", function (error) {
    console.error('redis tunnel error:', error);
});

tunnel.on("connect", function () {
    console.log('redis tunnel connected');
});

tunnel.on("pmessage", function (pattern, channel, message) {
    var { timeout, data } = JSON.parse(message)
    if (channel == 'schedule:skipto') {
        var room_id = data.room_id;
        console.log('scheduling skipto', room_id, timeout)
        setTimeout(() => {
            api.post('skipto', { room_id }, (status, data) => {
                console.log('result of scheduled skipto', status, data)
            })
        }, timeout)
    }
    else if (channel == 'schedule:room.dissolve') {
        Message.deleteMany({ room_id: data.room_id }, (err) => {
            console.log('removed chats from room id: ' + data.room_id, err)
        });
    }
});

setInterval(() => {
    api.post('roomCheck', {}, (status, data) => {
        console.log('room check done', status, data)
    })
}, 5*60*1000);

tunnel.psubscribe("schedule:*");