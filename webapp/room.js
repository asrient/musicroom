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
import Queue from "./components/player/queue.js";
import ProgressBar from "./components/player/progressBar.js";


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
                            <ProgressBar />
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