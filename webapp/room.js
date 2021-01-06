import $ from "jquery";
import React, { Component } from "react";
import Header from "./header.js";
import { TrackItem } from "./track.js";
import { UserLink } from "./user.js";
import { RoomArt } from "./roomArt.js";
import ChatBar from "./chatBar.js";
import { Link, Redirect } from "wouter";
import css from "./room.css";
import sharedCss from "./common.css";

function time() {
    return new Date().getTime() / 1000
}

class Queue extends React.Component {
    constructor(props) {
        super(props);
        this.state = { tracks: null, currentTrack: null }
    }
    componentDidMount() {
        this.parseState();
        this.unsub = window.state.subscribe(() => {
            this.parseState();
        })
    }
    parseState() {
        var st = window.state.getState();
        if (st.room) {
            this.setState({ ...this.state, tracks: st.room.tracks, currentTrack: st.room.current_roomtrack })
        }
    }
    componentWillUnmount() {
        this.unsub();
    }
    list() {
        if (this.state.tracks) {
            var tracks = this.state.tracks
            var currentTrack = this.state.currentTrack
            var arranged = []
            var currInd = tracks.findIndex((track) => { return track.roomtrack_id == currentTrack.roomtrack_id })
            if (currInd != undefined) {
                var counter = currInd;
                for (var i = 0; i < tracks.length; i++) {
                    if (counter >= tracks.length) {
                        counter = 0
                    }
                    if (counter != currInd) {
                        arranged.push(tracks[counter])
                    }
                    counter++;
                }
            }
            else {
                console.error('current track not found in tracks')
                arranged = tracks
            }
            var list = []
            arranged.forEach(track => {
                list.push(<TrackItem onClick={() => {
                    window.state.skipTo(track.roomtrack_id)
                }} playable key={track.roomtrack_id} {...track} >
                    <div className={css.delButt + ' center'} onClick={() => {
                        window.state.removeTrack(track.roomtrack_id)
                    }}>
                        <img className={"icon " + css.trashIcon} style={{ fontSize: '0.5rem' }} src="/static/icons/close.svg" />
                    </div>
                </TrackItem>)
            });
            if (list.length)
                return (<div>
                    <div style={{ paddingLeft: '2rem', paddingBottom: '0.6rem' }}
                        className='container size-m ink-light base-semibold'>
                        Up next
                    </div>
                    {list}
                </div>)
            else
                return (<div></div>)
        }
        else {
            return (<div>Loading tracks..</div>)
        }
    }
    render() {
        if (this.state.exit)
            return (<Redirect to='/rooms' />)
        else
            return (<div>
                {this.list()}
                <div className="center-col" style={{ padding: '1.3rem 0.3rem' }}>
                    <div style={{ paddingTop: '0.6rem' }} className="center">
                        <Link href='/room/addTracks' className={sharedCss.redButt_s + ' center'}>Add more</Link>
                    </div>
                </div>
                <br />
            </div>)
    }
}

class ProgressBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = { isPaused: true, durationCompleted: 0, duration: 100 }
        this.timerID = null
    }
    componentDidMount() {
        this.parseState();
        this.unsub = window.state.subscribe(() => {
            this.parseState();
        })
    }
    parseState() {
        var st = window.state.getState();
        if (st.room) {
            var isPaused = st.room.is_paused;
            var duration = st.room.current_roomtrack.duration
            if (!isPaused)
                var durationCompleted = duration - st.room.duration_to_complete + (time() - (new Date(st.room.play_start_time).getTime() / 1000))
            else
                var durationCompleted = duration - st.room.duration_to_complete
            this.setState({ ...this.state, isPaused, durationCompleted, duration })
            if (isPaused && this.timerID) {
                window.clearInterval(this.timerID);
                this.timerID = null
            }
            if (!isPaused && !this.timerID) {
                this.timerID = window.setInterval(this.progressTimer, 1000);
            }
        }
    }
    componentWillUnmount() {
        this.unsub();
        if (this.timerID)
            window.clearInterval(this.timerID);
        this.timerID = null
    }
    progressTimer = () => {
        if (!this.state.isPaused) {
            var durationCompleted = this.state.durationCompleted + 1
            this.setState({ ...this.state, durationCompleted })
        }
    }
    render() {
        var progress = (this.state.durationCompleted / this.state.duration) * 100
        var fillStyle = { width: progress + '%' }
        return (<div id={css.pBar}>
            <div id={css.pbar_fill} style={fillStyle} ></div>
        </div>)
    }
}

class Room extends React.Component {
    constructor(props) {
        super(props);
        this.state = { room: null, exit: false }
    }
    componentDidMount() {
        this.parseState();
        this.unsub = window.state.subscribe(() => {
            this.parseState();
        })
    }
    parseState() {
        var st = window.state.getState();
        if (st.room) {
            var topIds = []
            if (st.room.members) {
                var users = st.room.members.friends.concat(st.room.members.others)
                var userIds = users.map((user) => {
                    return user.user_id
                })
                if (this.state.room) {
                    topIds = this.state.room.topUserIds.filter((topId) => {
                        return userIds.includes(topId)
                    })
                }
                var topMsgIds = window.state.getTopMessages(true)
                topMsgIds.forEach((msgId) => {
                    if (!topIds.includes(msgId)) {
                        if (topIds.length > 6) {
                            topIds.push(msgId)
                        }
                        else {
                            var randInd = Math.floor(Math.random() * topIds.length)
                            //replace a random user with this one
                            topIds[randInd] = msgId
                        }
                    }
                })
                if (topIds.length < 6 && userIds.length > topIds.length) {
                    for (var i = 0; i < userIds.length; i++) {
                        if (!topIds.includes(userIds[i])) {
                            topIds.push(userIds[i]);
                        }
                        if (topIds.length >= 6) {
                            break;
                        }
                    }
                }
            }
            st.room.topUserIds = topIds
            this.setState({ ...this.state, room: st.room })
        }
        else
            this.setState({ ...this.state, exit: true })
    }
    componentWillUnmount() {
        this.unsub();
    }
    player() {
        if (this.state.room) {
            return (<TrackItem playing {...this.state.room.current_roomtrack} />)
        }
        else {
            return (<div>loading..</div>)
        }
    }
    playButton() {
        if (this.state.room) {
            if (this.state.room.is_paused) {
                return (<div onClick={() => {
                    window.state.play()
                }} className={css.playCircle + " center"}>
                    <img className={"icon clickable"} src="/static/icons/play.png" />
                </div>)
            }
            else {
                return (<div onClick={() => {
                    window.state.pause()
                }} className={css.playCircle + " center"}>
                    <img className={"icon clickable"} src="/static/icons/pause.png" />
                </div>)
            }
        }
        else {
            return (<div>..</div>)
        }
    }
    txt() {
        if (this.state.room && this.state.room.members) {
            var members_count = this.state.room.members_count
            var member_friends = []
            this.state.room.members.friends.forEach((friend, index) => {
                if (index < 5) {
                    member_friends.push(friend)
                }
            })
            var txt = []
            var html = null
            var othersCount = members_count - member_friends.length
            if (othersCount > 0) {
                //removing urself from the count
                othersCount--;
            }
            member_friends.forEach((friend, index) => {
                if (index) {
                    if (index == member_friends.length - 1 && othersCount == 0) {
                        txt.push(" and ")
                    }
                    else {
                        txt.push(", ")
                    }
                }
                friend.key = friend.user_id
                txt.push(<UserLink {...friend} className="ink-light" />)
            });

            if (othersCount) {
                txt.push(" and ")
                var t = ' other'
                if (othersCount > 1) {
                    t = t + 's'
                }
                txt.push(<Link key="others" href={'/room/members'}>{othersCount + t}</Link>)
            }
            if (txt.length) {
                txt = ['You are with '].concat(txt)
                html = (<>
                    <div>{txt}</div>
                    <Link href='/room/chat' className={css.chatButton + ' center'}>Chat &nbsp;
                <img src="/static/icons/expand.png" className="icon" style={{ fontSize: '0.7rem' }} />
                    </Link>
                </>)
            }
            else {
                html = (<div className="center-col size-l ink-white">
                    <div style={{ paddingBottom: '0.6rem' }}>Choose who can join you</div>
                    <Link href='/room/access' className={sharedCss.redButt_s + ' center'}>Access</Link>
                </div>)
            }
            return html
        }
        else {
            return (<div>Loading</div>)
        }
    }
    roomArt() {
        if (this.state.room && this.state.room.members) {
            var users = this.state.room.members.friends.concat(this.state.room.members.others)
            var show = users.filter((user) => {
                return this.state.room.topUserIds.includes(user.user_id)
            })
            return (<RoomArt users={show} size={2} />)
        }
        else {
            return (<div className="center">Loading</div>)
        }
    }
    render() {
        if (this.state.exit)
            return (<Redirect to='/rooms' />)
        else
            return (<>
                <Header roomControls />
                <div id={css.main}>
                    <div id={css.p1}>
                        <div className="center" style={{ height: '23rem', maxWidth: '40rem', overflow: 'hidden', margin: '0px auto' }}>
                            {this.roomArt()}
                        </div>
                        <div style={{ padding: '1.2rem 2rem', maxWidth: '30rem' }} className='container ink-grey base-light size-s'>
                            {this.txt()}
                        </div>
                    </div>
                    <div id={css.p2} className="container">
                        <div id={css.playerBox}>
                            <div id={css.player}>
                                {this.player()}
                                <div className="center">
                                    {this.playButton()}
                                </div>
                            </div>
                            <div>
                                <ProgressBar />
                            </div>
                        </div>
                        <br />
                        <Queue />
                        <br />
                        <br />
                    </div>
                </div>
                <ChatBar />
            </>)
    }
}

export default Room;