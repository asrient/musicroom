import { createStore } from 'redux';
import React, { Component } from "react";

var toastCounter = 0;
var messageCounter = 0;
const TOAST_DURATION = 3000;
const MESSAGE_DURATION = 30000;
const TYPING_PERIOD = 2200;
const PING_INTERVAL = 35 * 1000;

var MY_ID = null;
const PLAYBACK_SUPPORT = Hls.isSupported() || iOSSafari

const cache = window.localStorage;

if (!cache.messageCounter) {
    cache.messageCounter = 0
}

var isFirstPlay = true;

const LIVE_BASE_URL = (function () {
    var hostUrl = window.location.host;
    var protocol = 'https://'
    if (window.location.protocol == 'http:') {
        protocol = 'http://'
    }
    if (location.hostname == 'localhost') {
        hostUrl = 'localhost:3000'
    }
    else {
        hostUrl = 'live.' + hostUrl
    }
    return protocol + hostUrl;
})();


var liveApi = new window.Api(LIVE_BASE_URL + '/')

function time() {
    return new Date().getTime() / 1000
}

function timeMS() {
    return new Date().getTime()
}

function reducers(state = 0, action) {
    switch (action.type) {
        case 'INIT': {
            if (window.initialState.is_loggedin) {
                MY_ID = window.initialState.me.user_id
            }
            var st = {
                ...window.initialState,
                toasts: [],
                showAutoplayBanner: false,
                messages: [],
                typingUsers: [],
                latestEvent: null,
                isConnected: false,
                lastConnectedOn: cache.lastConnectedOn,
                isChatUpdated: false
            }
            return st;
        }
        case 'UPDATE': {
            return action.state
        }
        default:
            return state
    }
}

let store = createStore(reducers);

function update(st) {
    cache.lastConnectedOn = st.lastConnectedOn
    store.dispatch({ type: 'UPDATE', state: st });
}


class Live {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.connect()
    }
    connect = () => {
        this.socket = null;
        this.isConnected = false;
        var hostUrl = window.location.host;
        var protocol = 'https://'
        if (window.location.protocol == 'http:') {
            protocol = 'http://'
        }
        if (location.hostname == 'localhost') {
            hostUrl = 'localhost:3000'
        }
        else {
            hostUrl = 'live.' + hostUrl
        }
        this.socket = new io(hostUrl, { path: '/updates' });
        this.socket.on('connect', this._onOpen);
        this.socket.on('reconnect', this._onOpen);
        this.socket.on('disconnect', this._onClose);
        this.socket.on('connect_error', this._onError);
        this.socket.on('chat.text', (msg) => {
            var data = JSON.parse(msg);
            var user = data.action_user
            var _user = state.getUser(data.user_id)
            if (_user)
                state.message('text', data.date, _user, data.text)
        });
        this.socket.on('chat.typing', (msg) => {
            var data = JSON.parse(msg);
            var user = data.action_user
            state.typing(data.date, data.user_id, data.isTyping)
        });
        this.socket.on('update.members.connected', (msg) => {
            var data = JSON.parse(msg);
            var user = state.getUser(data.user_id)
            if (user && (user.user_id != MY_ID))
                state.announceEvent(user.name + ' now connected')
        });
        this.socket.on('update.members.disconnected', (msg) => {
            var data = JSON.parse(msg);
            var user = state.getUser(data.user_id)
            if (user && (user.user_id != MY_ID))
                state.announceEvent(user.name + ' disconnected from chat')
        });
        this.socket.on('update.members.add', (msg) => {
            var data = JSON.parse(msg);
            var user = data.action_user
            if (user.user_id != MY_ID) {
                state.addRoomMember(user)
                var txt = user.name + ' joined'
                state.announceEvent(txt)
            }
        });
        this.socket.on('update.members.remove', (msg) => {
            var data = JSON.parse(msg);
            var user = data.action_user
            if (user.user_id != MY_ID) {
                state.removeRoomMember(user)
                state.announceEvent(user.name + ' left')
            }
        });
        this.socket.on('update.tracks.add', (msg) => {
            var data = JSON.parse(msg);
            var user = data.action_user
            state.addRoomtrack(data.roomtrack)
            if (user.user_id != MY_ID) {
                state.toast(user.name + ' added ' + data.roomtrack.title, '/room')
            }
        });
        this.socket.on('update.tracks.remove', (msg) => {
            var data = JSON.parse(msg);
            var user = data.action_user
            state.removeRoomtrack(data.roomtrack)
            if (user.user_id != MY_ID) {
                state.toast(user.name + ' removed ' + data.roomtrack.title, '/room')
            }
        });
        this.socket.on('update.playback.pause', (msg) => {
            var data = JSON.parse(msg);
            var user = data.action_user
            state.updatePlayback(data.room)
            var name = user.name
            if (user.user_id == MY_ID) {
                name = 'You'
            }
            state.announceEvent(name + ' paused the music')
        });
        this.socket.on('update.playback.skipto', (msg) => {
            var data = JSON.parse(msg);
            var user = data.action_user
            var oldTrack = state.getState().room.current_roomtrack
            var wasPaused = state.getState().room.is_paused
            state.updatePlayback(data.room)
            var track = data.room.current_roomtrack
            if (user) {
                var name = user.name
                if (user.user_id == MY_ID) {
                    name = 'You'
                }
                var txt = name + ' changed the track to ' + track.title
                if (oldTrack.roomtrack_id == track.roomtrack_id) {
                    if (wasPaused && !data.room.is_paused) {
                        txt = name + ' resumed music'
                    }
                    else {
                        txt = name + ' seeked the track'
                    }
                }
                state.announceEvent(txt)
            }
            else {
                state.announceEvent('Now playing ' + track.title)
            }
        });
    }
    _onOpen = (event) => {
        console.log('connection LIVE!')
        state.announceEvent('You are connected')
        this.isConnected = true;
        var st = window.state.getState()
        st.isConnected = true;
        st.isChatUpdated = false;
        update(st);
        state.syncChats()
    }
    _onClose = (event) => {
        console.warn('connection DOWN!')
        state.announceEvent('Disconnected')
        this.isConnected = false;
        var st = window.state.getState()
        st.isConnected = false;
        st.lastConnectedOn = timeMS();
        update(st);
    }
    _onError = (event) => {
        console.error('connection error!', event)
        state.toast('Connection error')
    }
    send = (type, data) => {
        if (this.socket && this.isConnected) {
            this.socket.emit(type, JSON.stringify(data));
        }
        else {
            console.warn('Cant send msg, connection down', type, data);
        }
    }
}

var socket = null;

class Playback {
    constructor(track_id, url, sleek = 0, canPlay = true) {
        this.state = {
            url: null,
            track_id: null,
            started_on: null,
            sleek: 0,
            is_playing: false,
            can_play: true,
            is_loaded: false
        }
        this.state.url = url
        this.state.track_id = track_id
        this.state.sleek = sleek
        this.state.can_play = canPlay
        this.hls = new Hls();
        this.player = window.player;
        if (iOSSafari) {
            this.player.src = this.state.url;
            this._onPlaylistLoaded()
        }
        else {
            this.hls.attachMedia(this.player);
            this.hls.on(Hls.Events.MANIFEST_PARSED, this._onPlaylistLoaded);
            this.hls.on(Hls.Events.ERROR, this._onError);
            this.hls.on(Hls.Events.MEDIA_ATTACHED, this.loadUrl)
        }
    }
    kill() {
        this.hls.destroy();
    }
    loadUrl = () => {
        this.hls.loadSource(this.state.url);
    }
    play(sleek = null) {
        if (sleek) {
            this.state.started_on = time()
            this.state.sleek = sleek
        }
        this.state.can_play = true
        this.state.is_playing = true
        var currTime = time()
        var timePassed = currTime - this.state.started_on;
        console.log('curr sleek', this.state.sleek)
        this.player.currentTime = timePassed + this.state.sleek
        var promise = this.player.play();
        if (promise !== undefined) {
            promise.then(_ => {
                if (iOSSafari && isFirstPlay) {
                    //cuz in ios it always starts from the begining
                    isFirstPlay = false
                    window.setTimeout(() => {
                        state.syncPlayback()
                    }, 200)
                }
            }).catch(error => {
                // Autoplay was prevented.
                // Show a "Play" button so that user can start playback.
                this.state.is_playing = false
                var st = state.getState()
                st.showAutoplayBanner = true
                update(st)
            });
        }
    }
    pause() {
        this.state.can_play = false
        this.state.is_playing = false
        this.state.started_on = time()
        this.state.sleek = this.player.currentTime
        this.player.pause();
    }
    _onPlaylistLoaded = (e, data) => {
        this.state.started_on = time()
        this.state.is_loaded = true
        if (this.state.can_play)
            this.play();
    }
    _onError = (e, data) => {
        var errorType = data.type;
        var errorDetails = data.details;
        var errorFatal = data.fatal;

        switch (data.details) {
            case Hls.ErrorDetails.FRAG_LOAD_ERROR:
                // ....
                break;
            default:
                break;
        }
    }
}

window.player.addEventListener('loadedmetadata', (event) => {
    //mainly needed for ios to check for plist loaded
    if (iOSSafari) {
        state.syncPlayback()
    }
});

/*
//this makes plaback go crazy
//apperantly hls seeks thes track ever now and then which causes this event to fire
window.player.addEventListener('seeked', (event) => {
    console.log('seeked', event)
    state.syncPlayback()
});
*/

window.player.addEventListener('play', (event) => {
    if (state.player) {
        if (!state.player.state.is_playing) {
            state.play()
        }
    }
});

window.player.addEventListener('pause', (event) => {
    if (state.player) {
        if (state.player.state.is_playing) {
            var st = state.getState()
            if (window.player.currentTime < st.room.current_roomtrack.duration - 2) {
                console.log('pausing', window.player.currentTime, st.room.current_roomtrack.duration)
                state.pause()
            }
            else {
                //usually browser pauses the player after track finished
                console.warn('Cant pause near end')
            }

        }
    }
});

const sampleMsg = {
    type: 'text',
    date: time(),
    from: { user_id: 1, name: 'Sample User' },
    text: "Hello everyone!"
}

var state = {
    getState: store.getState,
    subscribe: store.subscribe,
    player: null,
    init: function () {
        if (window.initialState.is_loggedin) {
            socket = new Live()
        }
        store.dispatch({ type: 'INIT' });
        var st = store.getState();
        if (st.room) {
            this.changeRoom(st.room, false)
        }
        else {
            this.clearCacheMessages()
        }
        if (st.me) {
            window.setInterval(state.ping, PING_INTERVAL)
        }
    },
    ping() {
        api.get('ping', null, (status, data) => {
            if (status != 201) {
                console.error("Failed to ping", status, data);
            }
        })
    },
    syncChats() {
        var st = store.getState();
        if (st.room) {
            var currTime = timeMS();
            if (st.isConnected && currTime - st.lastConnectedOn > 1500) {
                var startTime = st.lastConnectedOn || 0
                console.log("syncing chats..", startTime);
                liveApi.get('chats', { startTime }, (status, data) => {
                    if (status == 200) {
                        data.chats.forEach(chat => {
                            var _user = state.getUser(chat.user_id)
                            if (_user) {
                                var key = cache.messageCounter;//str
                                cache.messageCounter++;
                                var msg = { key, type: 'text', date: chat.date, from: _user, text: chat.text }
                                cache['msg' + key] = JSON.stringify(msg)
                            }
                        });
                    }
                    else {
                        console.error('could not get chats', status, data)
                    }
                    var st = store.getState();
                    st.isChatUpdated = true;
                    if (st.isConnected)
                        st.lastConnectedOn = timeMS()
                    update(st);
                })
            }
            else {
                st.isChatUpdated = true;
                update(st)
            }
        }
    },
    getUser(user_id) {
        var st = store.getState();
        if (st.room && st.room.members) {
            var friends = st.room.members.friends
            var others = st.room.members.others
            var user = friends.find((friend) => { return friend.user_id == user_id })
            if (!user) {
                user = others.find((other) => { return other.user_id == user_id })
            }
            if (!user) {
                return null
            }
            else
                return user
        }
        else {
            return null
        }
    },
    popTyping(user_id) {
        var st = store.getState();
        if ((user_id in st.typingUsers) && (st.typingUsers[user_id] + TYPING_PERIOD <= timeMS())) {
            delete st.typingUsers[user_id]
            update(st)
        }
    },
    typing(date, user_id, isTyping) {
        var st = store.getState();
        if (isTyping) {
            st.typingUsers[user_id] = date
            update(st)
            window.setTimeout(() => {
                this.popTyping(user_id)
            }, TYPING_PERIOD + 900)
        }
        else {
            if (user_id in st.typingUsers) {
                delete st.typingUsers[user_id]
                update(st)
            }
        }
    },
    setIsTyping(isTyping) {
        var st = store.getState();
        if (st.room) {
            socket.send('chat.typing', { isTyping, date: timeMS() })
        }
    },
    getTopMessages(getUserIds = false) {
        var st = store.getState();
        var msgs = st.messages
        var top = [];
        var user_ids = []
        for (var i = msgs.length - 1; i >= 0; i--) {
            if (!user_ids.includes(msgs[i].from.user_id)) {
                top.splice(0, 0, msgs[i])
                user_ids.push(msgs[i].from.user_id)
            }
            if (top.length > 3) {
                break;
            }
        }
        if (getUserIds)
            return user_ids
        return top;
    },
    sendMessage(text) {
        var st = store.getState();
        if (st.room) {
            socket.send('chat.text', { text, date: timeMS() })
        }
    },
    announceEvent(txt) {
        var st = store.getState();
        if (st.room)
            this.message('event', timeMS(), null, txt)
        else
            this.toast(txt)
    },
    message(type, date, from, text = null) {
        var st = store.getState();
        st.lastConnectedOn = timeMS();
        var key = cache.messageCounter;//str
        cache.messageCounter++;
        var msg = { key, type, date, from, text }
        if (type == 'text') {
            st.messages.push(msg)
            var loc = window.location.pathname;
            if (loc != '/room' && loc != '/room/chat') {
                this.toast(<div>
                    <div className="base-semibold" style={{ fontSize: '0.95rem' }}>
                        {from.name}
                    </div>
                    <div>
                        {text}
                    </div>
                </div>, '/room/chat')
            }
            window.setTimeout(() => {
                this.popMessage(key)
            }, MESSAGE_DURATION)
        }
        else {
            st.latestEvent = msg
            var loc = window.location.pathname;
            if (loc != '/room/chat') {
                this.toast(text, '/room')
            }
        }
        cache['msg' + key] = JSON.stringify({ type, key, date, from, text })
        update(st)
    },
    clearCacheMessages() {
        console.log('clearing cache messages..')
        for (var i = 0; i < cache.messageCounter; i++) {
            cache.removeItem('msg' + i)
        }
        cache.messageCounter = 0
    },
    resetCacheMessages() {
        this.clearCacheMessages();
        var st = store.getState();
        st.isChatUpdated = true;
        st.lastConnectedOn = 0;
        update(st)
        this.syncChats();
    },
    getCacheMessages() {
        var list = []
        for (var i = 0; i < cache.messageCounter; i++) {
            if (cache['msg' + i]) {
                list.push(JSON.parse(cache['msg' + i]))
            }
        }
        return list;
    },
    popMessage(key) {
        var st = store.getState();
        var msgs = st.messages.filter((msg) => { return msg.key != key })
        st.messages = msgs;
        update(st);
    },
    closeAutoplayBanner() {
        var st = store.getState();
        st.showAutoplayBanner = false;
        update(st)
    },
    popToast: function (key) {
        var st = store.getState();
        var toasts = st.toasts.filter((toast) => { return toast.key != key })
        st.toasts = toasts;
        update(st);
    },
    toast: function (html, link = null) {
        var key = toastCounter;
        toastCounter++;
        var st = store.getState();
        st.toasts.push({ key, html, link });
        if (st.toasts.length > 3) {
            st.toasts.splice(0, 1)
        }
        update(st)
        window.setTimeout(() => {
            this.popToast(key)
        }, TOAST_DURATION)
    },
    syncPlayback: function () {
        if (PLAYBACK_SUPPORT) {
            var st = store.getState();
            console.log('Syncing playback..')
            if (st.room) {
                var roomtrack = st.room.current_roomtrack
                var sleek = roomtrack.duration - st.room.duration_to_complete + (time() - (new Date(st.room.play_start_time).getTime() / 1000))
                if (this.player && this.player.state.track_id == roomtrack.track_id) {
                    if (!st.room.is_paused)
                        this.player.play(sleek)
                    else
                        this.player.pause()
                }
                else {
                    if (this.player) {
                        this.player.kill()
                        this.player = null
                    }
                    this.player = new Playback(roomtrack.track_id, roomtrack.playback_url, sleek, !st.room.is_paused)
                }
            }
            else {
                if (this.player) {
                    this.player.kill()
                    this.player = null
                }
            }
        }
        else {
            this.toast('Streaming not supported on this device')
        }
    },
    updatePlayback: function (roomState) {
        var st = store.getState();
        var room = { ...st.room, ...roomState }
        st.room = room
        update(st)
        this.syncPlayback()
    },
    addRoomtrack: function (track) {
        var st = store.getState();
        if (st.room.tracks) {
            var alreadyThere = st.room.tracks.find((rt) => { return rt.roomtrack_id == track.roomtrack_id })
            if (!alreadyThere) {
                st.room.tracks.push(track)
                update(st)
            }
        }
    },
    removeRoomtrack: function (track) {
        var st = store.getState();
        if (st.room.tracks) {
            var index = st.room.tracks.findIndex((rt) => { return rt.roomtrack_id == track.roomtrack_id })
            if (index >= 0) {
                st.room.tracks.splice(index, 1)
                update(st)
            }
        }
    },
    addRoomMember: function (user) {
        api.post('friends/status', { user_id: user.user_id }, (status, data) => {
            var st = store.getState();
            var grp = 'others'
            if (status == 200 && data.friendship_status == 3) {
                grp = 'friends'
            }
            if (status != 200) {
                console.error("err in getting friendship status", status, data)
            }
            if (st.room.members) {
                var alreadyThere = st.room.members[grp].find((member) => { return member.user_id == user.user_id })
                if (!alreadyThere) {
                    st.room.members[grp].push(user)
                    st.room.members_count++;
                    console.log(user, 'joined', grp, st.room.members)
                    update(st)
                }
            }
        })
    },
    removeRoomMember: function (user) {
        var look = (grp) => {
            var index = st.room.members[grp].findIndex((member) => { return member.user_id == user.user_id })
            if (index >= 0) {
                st.room.members[grp].splice(index, 1)
                st.room.members_count--;
                console.log(user, 'left', grp, index)
                update(st)
                return true;
            }
            return false;
        }
        var st = store.getState();
        if (st.room.members) {
            if (!look('friends')) {
                look('others')
            }
        }
    },
    updateRoomMembers: function () {
        var st = store.getState();
        if (st.room != null) {
            api.get('room/members', null, (status, data) => {
                if (status == 200) {
                    console.log('got room members', data)
                    //data={friends,others}
                    st = store.getState();
                    if (st.room != null) {
                        st.room.members_count = data.friends.length + data.others.length
                        st.room.members = data
                        update(st)
                    }
                }
                else {
                    console.error(status, data)
                }
            })
        }
    },
    updateRoomTracks: function () {
        var st = store.getState();
        if (st.room != null) {
            api.get('room/tracks', null, (status, data) => {
                if (status == 200) {
                    console.log('got room tracks', data)
                    st = store.getState();
                    if (st.room != null) {
                        st.room.tracks = data.roomtracks
                        update(st)
                    }
                }
                else {
                    console.error(status, data)
                }
            })
        }
    },
    leaveRoom: function () {
        var st = store.getState();
        if (st.room != null) {
            api.get('room/leave', null, (status, data) => {
                if (status == 201) {
                    st = store.getState();
                    if (st.room != null) {
                        st.room = null;
                        st.messages = []
                        st.typingUsers = []
                        st.latestEvent = null
                        update(st)
                        this.clearCacheMessages()
                        this.toast('You left the room')
                        this.syncPlayback()
                    }
                }
                else {
                    this.toast('error: Could not leave the room')
                    console.error(status, data)
                }
            })
        }
    },
    changeRoom: function (room, clearCacheMsgs = true) {
        var st = store.getState();
        room.members = null;
        room.tracks = null;
        st.room = room
        st.latestEvent = null
        st.messages = []
        st.typingUsers = []
        st.isChatUpdated = false;
        update(st)
        if (clearCacheMsgs) {
            this.clearCacheMessages()
        }
        this.syncPlayback()
        this.updateRoomMembers()
        this.updateRoomTracks()
    },
    joinRoom: function (roomId, cb = function () { }) {
        api.post('room/join', { room_id: roomId }, (status, data) => {
            if (status == 201) {
                this.changeRoom(data)
                this.toast('Welcome to the room', '/room')
                cb(true, data)
            }
            else {
                console.error(status, data)
                cb(false)
            }
        })
    },
    createRoom: function (trackIds, cb = function () { }) {
        api.post('room/create', { track_ids: trackIds }, (status, data) => {
            if (status == 201) {
                this.changeRoom(data)
                this.toast('Room created', '/room')
                cb(true, data)
            }
            else {
                console.error(status, data)
                cb(false)
            }
        })
    },
    removeTrack: function (roomtrackId, cb = function () { }) {
        api.post('room/tracks/remove', { roomtrack_ids: [roomtrackId] }, (status, data) => {
            if (status == 201) {
                this.toast('Track removed', '/room')
                cb(true)
            }
            else {
                cb(false)
            }
        })
    },
    play() {
        var st = store.getState();
        if (st.room) {
            if (st.room.is_paused) {
                api.get('room/play', null, (status, data) => {
                    if (status == 201) {
                        //
                    }
                    else {
                        this.toast('Falied to play', '/room')
                    }
                })
            }
        }
    },
    pause() {
        var st = store.getState();
        if (st.room) {
            if (!st.room.is_paused) {
                api.get('room/pause', null, (status, data) => {
                    if (status == 201) {
                        //
                    }
                    else {
                        this.toast('Falied to pause', '/room')
                    }
                })
            }
        }
    },
    skipTo(roomtrackId, duration = null) {
        var st = store.getState();
        if (st.room) {
            var data = { roomtrack_id: roomtrackId, duration }
            api.post('room/skipto', data, (status, res) => {
                if (status == 201) {
                    //
                }
                else {
                    this.toast('Falied to skip', '/room')
                }
            })
        }
    }
}

export default state;