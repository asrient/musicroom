require('dotenv').config()
const EventEmitter = require('events');
var cookieParser = require('cookie-parser')
var app = require('express')();
var redis = require('redis');
var http = require('http').createServer(app);
var cookie = require("cookie");
const { api } = require('./shared.js');
var io = require('socket.io')(http, { path: '/updates', serveClient: false });
var mongoose = require('mongoose');
var { Message } = require('./models');
var cors = require('cors');

mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/mr', { useNewUrlParser: true });

app.use(cors({
    origin: process.env.MAIN_SERVER_PUBLIC_URL || "http://localhost:8080",
    credentials: true,
}))

app.use(cookieParser())

const PORT = process.env.PORT || 3000;

var tunnel = redis.createClient(process.env.REDIS_URL);

var userTasks = new EventEmitter;

tunnel.on("error", function (error) {
    console.error('redis tunnel error:', error);
});

tunnel.on("connect", function () {
    console.log('redis tunnel connected');
});

tunnel.on("pmessage", function (pattern, channel, message) {
    var body = JSON.parse(message)
    if (channel == 'live:relay.event') {
        if (body.group && body.type && body.data) {
            io.in(body.group).emit(body.type, JSON.stringify(body.data));
        }
    }
    else if (channel == 'live:task.user') {
        if (body.task && body.user_id && body.data) {
            //console.log('usertask event', 'u-' + body.user_id, body.task, body.data)
            userTasks.emit('u-' + body.user_id, body.task, body.data)
        }
    }
});

tunnel.psubscribe("live:*");

app.get('/', (req, res) => {
    res.send('<h1>Friendzone updates</h1>');
});

app.get('/cookie', (req, res) => {
    if (req.query.mrsid) {
        res.cookie('mrsid', req.query.mrsid)
        res.send('mrsid: ' + req.query.mrsid);
    }
    else {
        res.send('<h1>[DEBUG] Set mrsid</h1>');
    }
});

app.get('/chats', (req, res) => {
    if (req.cookies.mrsid) {
        api.post("auth", { mrsid: req.cookies.mrsid }, (status, data) => {
            console.log(status, data)
            if (status == 200 && data != null && data.user_id != null && data.room_id) {
                var start = new Date(0);
                if (req.query.startTime)
                    start = new Date(parseInt(req.query.startTime));
                Message.find({ room_id: data.room_id, type: 'chat.text', date: { $gt: start } })
                    .sort({ 'date': -1 }).limit(50).exec((err, docs) => {
                        if (!err) {
                            var list = [];
                            docs.forEach((doc) => {
                                var chat = { ...doc.data, date: doc.date.getTime() }
                                list.splice(0, 0, chat)
                            })
                            res.status(200).json({ chats: list });
                        }
                        else {
                            res.status(400).json({ msg: 'query failed' });
                        }
                    })
            }
            else {
                res.status(400).json({ msg: 'could not auth' });
            }
        })
    }
    else {
        res.status(400).json({ msg: 'cookie missing' });
    }
});

class Peer {
    constructor(socket, user_id, room_id = null) {
        this.socket = socket;
        this.user_id = user_id;
        this.room_id = room_id;
        this.socket.on('disconnect', this.disconnected);
        this.socket.join('user-' + this.user_id);
        if (this.room_id)
            this.roomConnect(this.room_id)
        //console.log(this.socket.id, ' | ', 'listening to usertasks', 'u-' + this.user_id)
        userTasks.on('u-' + this.user_id, this.task)
        this.socket.on('chat.text', (data) => {
            data = JSON.parse(data)
            if (data.date && data.text) {
                this.roomSend('chat.text', { date: data['date'], text: data['text'], user_id: this.user_id })
                var msg = new Message({
                    date: new Date(data.date),
                    type: 'chat.text',
                    data: { text: data.text, user_id: this.user_id },
                    room_id: this.room_id
                })
                console.log(data, msg)
                msg.save();
            }
        })
        this.socket.on('chat.typing', (data) => {
            data = JSON.parse(data)
            if (data.date && 'isTyping' in data) {
                this.roomSend('chat.typing', { date: data['date'], isTyping: data['isTyping'], user_id: this.user_id })
            }
        })
    }
    task = (task, data) => {
        if (task == 'room.join') {
            if (data.room_id != this.room_id)
                this.roomConnect(data.room_id)
        }
        else if (task == 'room.leave') {
            if (data.room_id == this.room_id)
                this.roomDisconnect()
        }
    }
    disconnected = () => {
        if (this.room_id) {
            this.roomSend('update.members.disconnected', { user_id: this.user_id })
        }
    }
    roomDisconnect = () => {
        //console.log(this.socket.id, ' | ', this.user_id, 'leaving room', this.room_id)
        if (this.room_id) {
            this.disconnected()
            this.socket.leave('room-' + this.room_id);
            this.room_id = null
        }
    }
    roomConnect = (_room_id) => {
        //console.log(this.socket.id, ' | ', this.user_id, 'joining room', _room_id)
        if (_room_id != this.room_id)
            this.roomDisconnect()
        this.socket.join('room-' + _room_id);
        this.room_id = _room_id
        this.roomSend('update.members.connected', { user_id: this.user_id })
    }
    roomSend = (topic, data) => {
        if (this.socket && this.room_id) {
            io.in('room-' + this.room_id).emit(topic, JSON.stringify(data));
        }
    }
    dispatchMsg = (topic, data) => {
        if (this.socket) {
            this.socket.emit(topic, JSON.stringify(data));
        }
    }
}

io.on('connection', function (socket) {
    console.log('a user connected');
    var cookies = cookie.parse(socket.handshake.headers.cookie);
    if (cookies.mrsid) {
        api.post("auth", { mrsid: cookies.mrsid }, (status, data) => {
            console.log(status, data)
            if (status == 200 && data != null && data.user_id != null) {
                new Peer(socket, data.user_id, data.room_id);
            }
        })
    }
    else {
        console.error("conn has no mrsid cookie")
    }
});

http.listen(PORT, () => {
    console.log('listening on *:3000');
});