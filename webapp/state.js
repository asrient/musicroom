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

const LIVE_BASE_URL = window.initialState.live_url;

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
            return {...action.state}
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
        console.log('connecting to live server..',LIVE_BASE_URL)
        this.socket = new io(LIVE_BASE_URL, { path: '/updates' });
        this.socket.on('connect', this._onOpen);
        this.socket.on('reconnect', this._onReconnect);
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
        this.socket.on('update.join_request.result', (msg) => {
            const data = JSON.parse(msg);
            console.log('[update.join_request.result]', data);
            const { room, was_approved } = data;
            state.announceEvent(was_approved? "Request to join room accepted": `Your request to join room #${room.room_id} was denied.`);
            if(was_approved) {
                // this automatically takes care of requested_room state
                state.syncRoomState();
            } else {
                // remove the request from local state
                const st = window.state.getState();
                st.requested_room = null;
                update(st);
            }
        });
        this.socket.on('update.join_request.add', (msg) => {
            const data = JSON.parse(msg);
            console.log('[update.join_request.add]', data);
            const { action_user } = data;
            state.announceEvent(`${action_user.name} is requesting to join.`);
            const st = window.state.getState();
            if(!st.room) {
                console.error('Received join request while not in a room. This should not happen.', st, action_user);
                return;
            }
            st.room.join_request_ids.push(action_user.user_id);
            update(st);
        });
        this.socket.on('update.join_request.remove', (msg) => {
            const data = JSON.parse(msg);
            console.log('[update.join_request.remove]', data);
            const { action_user } = data;
            const st = window.state.getState();
            if(!st.room) {
                console.error('Received join request update while not in a room. This should not happen.', st, action_user);
                return;
            }
            st.room.join_request_ids = st.room.join_request_ids.filter(id => id != action_user.user_id);
            update(st);
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
                state.toast(user.name + ' added ' + data.roomtrack.title, '/browse')
            }
        });
        this.socket.on('update.tracks.remove', (msg) => {
            var data = JSON.parse(msg);
            var user = data.action_user
            state.removeRoomtrack(data.roomtrack)
            if (user.user_id != MY_ID) {
                state.toast(user.name + ' removed ' + data.roomtrack.title, '/browse')
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
    _onReconnect = (event) => {
        console.log('connection RECONNECTED!')
        if((timeMS() - window.state.getState().lastConnectedOn) > 1000*5)
            state.syncRoomState();
        this._onOpen(event);
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

function getPlaybackUrl(track_id, cb){
    let url = sessionStorage.getItem("stream/"+track_id);
    if (url){
        cb(url);
    }
    else{
        api.get('tracks/stream/'+track_id, null, (status, data) => {
            if (status == 200) {
                console.log('loaded playback url', data)
                sessionStorage.setItem("stream/"+track_id, data.stream_url);
                cb(data.stream_url);
            }
            else {
                console.error(status, data)
                cb(null);
            }
        })
    }
}


var socket = null;

class Playback {
    constructor(track_id, sleek = 0, canPlay = true) {
        this.state = {
            url: null,
            track_id: null,
            started_on: null,
            sleek: 0,
            is_playing: false,
            can_play: true,
            is_loaded: false,
        }
        this.state.track_id = track_id
        this.state.sleek = sleek
        this.state.can_play = canPlay
        this.hls = new Hls();
        this.player = window.player;
        if (iOSSafari) {
            this.loadPlaybackData(() => {
                this.player.src = this.state.url;
                this._onPlaylistLoaded();
            });
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
    loadPlaybackData (cb) {
        getPlaybackUrl(this.state.track_id, (url) => {
            if(!url){
                alert('Could not stream this song');
                return;
            }
            this.state.url = url;
            cb();
        });
    }
    loadUrl = () => {
        this.loadPlaybackData(() => {
            this.hls.loadSource(this.state.url);
        });
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
        console.log('curr sleek', this.state.sleek, 'current player pos',  this.player.currentTime)
        this.player.currentTime = timePassed + this.state.sleek
        var promise = this.player.play();
        if (promise !== undefined) {
            promise.then(_ => {
                console.log('playback started', this.player.currentTime)
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
                console.warn('playback prevented', error)
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
    _store: store,
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
    // use it when you were disconnected for a long time and might have missed some updates
    syncRoomState() {
        api.get('room', null, (status, data) => {
            if(status != 200){
                console.error("Failed to sync room", status, data);
                return;
            }
            const st = window.state.getState();
            st.requested_room = data.requested_room;
            update(st);
            if(!!data.room){
                this.changeRoom(data.room, false);
            } else if(!!state.getState().room){
                this.changeRoom(null, true);
            }
        });
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
            if (loc != '/browse' && loc != '/room/chat') {
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
                this.toast(text, '/browse')
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
                    this.player = new Playback(roomtrack.track_id, sleek, !st.room.is_paused, roomtrack.image_url)
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
            const tracks = [...st.room.tracks];
            var alreadyThere = tracks.find((rt) => { return rt.roomtrack_id == track.roomtrack_id })
            if (!alreadyThere) {
                tracks.push(track);
                st.room.tracks = tracks;
                update(st)
            }
        }
    },
    removeRoomtrack: function (track) {
        var st = store.getState();
        if (st.room.tracks) {
            const tracks = [...st.room.tracks];
            var index = tracks.findIndex((rt) => { return rt.roomtrack_id == track.roomtrack_id })
            if (index >= 0) {
                tracks.splice(index, 1);
                st.room.tracks = tracks;
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
                const members = { ...st.room.members };
                var alreadyThere = members[grp].find((member) => { return member.user_id == user.user_id })
                if (!alreadyThere) {
                    members[grp].push(user);
                    st.room.members_count++;
                    st.room.members = members;
                    console.log(user, 'joined', grp, members);
                    update(st)
                }
            }
        })
    },
    removeRoomMember: function (user) {
        var look = (grp) => {
            var index = st.room.members[grp].findIndex((member) => { return member.user_id == user.user_id })
            if (index >= 0) {
                const members = { ...st.room.members };
                members[grp].splice(index, 1);
                st.room.members_count--;
                console.log(user, 'left', grp, index);
                st.room.members = members;
                update(st);
                return true;
            }
            return false;
        }
        var st = store.getState();
        if (st.room.members) {
            if (!look('friends')) {
                look('others');
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
        const promise = new Promise((resolve, reject) => {
            var st = store.getState();
            if (st.room != null) {
                api.get('room/leave', null, (status, data) => {
                    if (status == 201) {
                        st = store.getState();
                        if (st.room != null) {
                            this.toast('You left the room');
                            this.changeRoom(null, true);
                        }
                        resolve(status, data);
                    }
                    else {
                        this.toast('error: Could not leave the room')
                        console.error(status, data);
                        reject(status, data);
                    }
                });
            } else {
                reject(null, 'Not in a room');
            }
        });
        return promise;
    },
    changeRoom: function (room, clearCacheMsgs = true) {
        var st = store.getState();
        if(!!room){
            room.members = null;
            room.tracks = null;
        }
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
        if(!!room){
            this.updateRoomMembers();
            this.updateRoomTracks();
        }
    },
    requestJoinRoom: function (room_id, cb = function () { }) {
        api.post('room/requestJoin', { room_id }, (status, data) => {
            if (status == 201 && !!data.room) {
                const requested_room = data.room;
                this.toast('Join request sent');
                const st = store.getState();
                st.requested_room = requested_room;
                update(st);
                cb(true, data);
            }
            else {
                console.error(status, data);
                cb(false);
            }
        })
    },
    cancelJoinRoom: function (cb = function () { }) {
        if(!store.getState().requested_room) return;
        const room_id = store.getState().requested_room.room_id;
        api.post('room/cancelJoinRoom', { room_id }, (status, data) => {
            if (status == 201) {
                this.toast('Join request cancelled.');
                const st = store.getState();
                st.requested_room = null;
                update(st);
                cb(true, data);
            }
            else {
                console.error(status, data);
                cb(false);
            }
        })
    },
    respondJoinRoom: function (user_id, approve) {
        return new Promise((resolve, reject) => {
            api.post('room/respondJoin', { user_id, approve }, (status, data) => {
                if (status == 201) {
                    resolve(data);
                }
                else {
                    console.error(status, data);
                    reject(status, data);
                }
            })
        });
    },
    joinRoomWithCode: function (code, cb = function () { }) {
        api.post('room/join', { code }, (status, data) => {
            if (status == 201) {
                this.toast('Welcome to the room', '/browse')
                this.changeRoom(data.room);
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
                this.toast('Room created', '/browse')
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
                this.toast('Track removed', '/browse')
                cb(true)
            }
            else {
                cb(false)
            }
        })
    },
    // creates a room if not present, or add track to existing room and play it
    playTrack(track_id) {
        if (!store.getState().room) {
            return new Promise((resolve, reject) => {
                this.createRoom([track_id], (res) => {
                    resolve(res);
                });
            });
        } else {
            return this.addTrackToRoom(track_id, true);
        }
    },
    addTrackToRoom(track_id, play = false) {
        return new Promise((resolve, reject) => {
            api.post('room/tracks/add', { track_ids: [track_id], play }, (status, data) => {
                if (status == 201) {
                    this.toast('Tracks added successfully','/browse');
                    resolve(data);
                }
                else {
                    this.toast('Could not add tracks','/browse');
                    console.error(status, data);
                    reject(status, data);
                }
            });
        });
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
                        this.toast('Falied to play', '/browse')
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
                        this.toast('Falied to pause', '/browse')
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
                    this.toast('Falied to skip', '/browse')
                }
            })
        }
    },
    getCurrentTrackIndex() {
        var st = store.getState();
        if (!st.room) { return -1; }
        return st.room.tracks.findIndex(t => t.roomtrack_id == st.room.current_roomtrack.roomtrack_id);
    },
    playAdjacent(flag) {
        const currInd = this.getCurrentTrackIndex();
        if(currInd<0){ return; }
        const st = store.getState();
        const n = st.room.tracks.length;
        let reqInd = currInd + (flag==='next' ? 1 : -1);
        if(reqInd<0){ reqInd = n-1; }
        if(reqInd>=n){ reqInd = 0; }
        const roomtrackId = st.room.tracks[reqInd].roomtrack_id;
        this.skipTo(roomtrackId);
    },
    markRequestsAsSeen() {
        // join_request_ids is only used to keep track of new requests, actual requests are fetched from api when needed
        const st = store.getState();
        if (!st.room) {
            return;
        }
        st.room.join_request_ids = [];
        update(st);
    },
    getJoinRequests() {
        const promise = new Promise((resolve, reject) => {
            api.get('room/getJoinRequests', null, (status, data) => {
                if (status == 200) {
                    resolve(data);
                }
                else {
                    reject(status, data);
                }
            });
        });
        return promise;
    },
    setUserPreference (key, value) {
        const promise = new Promise((resolve, reject) => {
            api.post('set/userPreference', { key, value }, (status, data) => {
                if (status == 201) {
                    const st = store.getState();
                    st.user_preferences[key] = value;
                    resolve(data);
                }
                else {
                    console.error(status, data);
                    reject(status, data);
                }
            });
        });
        return promise;
    },
    codeExport () {
        const code = store.getState().room?.room_code;
        if (!code) {
            state.toast("Failed to copy to clipboard.");
            return;
        }
        const url = window.location.protocol + '//' + window.location.host + '/code/' + code;
        const shareData = {
            title: 'Friendzone Party?',
            text: "Lets listen to music together on Friendzone! Room code: " + code + " See you there!",
            url,
        }
        const clipText = url;
        if (navigator.share) {
            // Web Share API is supported
            window.navigator.share(shareData).then(() => {
                state.toast("Room code shared!")
            })
                .catch((e) => {
                    console.error(e)
                });
        } else {
            var promise = navigator.clipboard.writeText(clipText).then(() => {
                state.toast("Link copied to clipboard")
            }, () => {
                state.toast("Failed to copy to clipboard")
            });
        }
    }
}

export default state;