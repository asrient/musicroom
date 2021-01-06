import $ from "jquery";
import React, { Component } from "react";
import css from "./chat.css";
import Header from "./header.js";
import ChatBar from "./chatBar.js";
import { Link, Redirect } from "wouter";
import { UserCircle } from "./user.js";

function formatTime(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}

class Chat extends React.Component {
    constructor(props) {
        super(props);
        this.state = { messages: null, typing: [], exit: false, isConnected: false, chatSyncing: false }
    }
    componentDidMount() {
        this.parseState(true);
        window.setTimeout(() => {
            window.scrollTo(0, document.body.scrollHeight);
        }, 300)
        this.unsub = window.state.subscribe(() => {
            this.parseState();
        })
    }
    parseState(canSync = false) {
        var st = window.state.getState();
        if (st.room) {
            var typing = []
            if (st.room.members) {
                if (!st.isChatUpdated && canSync) {
                    window.state.syncChats()
                }
                var users = st.room.members.friends.concat(st.room.members.others)
                Object.keys(st.typingUsers).forEach(userId => {
                    var user = users.find((user) => { return user.user_id == userId })
                    if (user != undefined) {
                        typing.push(user)
                    }
                });
            }
            var msgs = window.state.getCacheMessages()
            //in reverse order
            msgs.sort((m1, m2) => {
                return m2.date - m1.date
            })
            this.setState({ ...this.state, messages: msgs, typing, isConnected: st.isConnected, chatSyncing: !st.isChatUpdated })
        }
        else
            this.setState({ ...this.state, exit: true })
    }
    componentWillUnmount() {
        this.unsub();
    }
    message(key, type = 'text', from, date, txt) {
        if (type == 'text')
            return (<div key={key} className={css.chat}>
                <div className={css.avatarBox}>
                    <UserCircle nopopup {...from} size='2.5rem' style={{ margin: '0px' }} />
                </div>
                <div className={css.text}>
                    <div className={css.chatTitle}>
                        {from.name}
                        <span className={css.chatTime}>{formatTime(new Date(date))}</span>
                    </div>
                    <div>{txt}</div>
                </div>
            </div>)
        else
            return (<div key={key} className={'center ' + css.event}>
                {txt}
            </div>)
    }
    chats() {
        if (this.state.messages) {
            var list = []
            this.state.messages.forEach(chat => {
                list.push(this.message(chat.key, chat.type, chat.from, chat.date, chat.text))
            });
            return (<div className={'container ' + css.container}>
                {this.typingText()}
                {list}
            </div>)
        }
        else {
            return (<div style={{ padding: '3rem 1rem' }} className="center">
                Loading..
            </div>)
        }
    }
    typingText() {
        var st = window.state.getState()
        var txt = ''
        var count = 0
        this.state.typing.forEach((user) => {
            if (count < 3 && user.user_id != st.me.user_id) {
                if (count)
                    txt += ', ' + user.name
                else
                    txt = user.name
                count++
            }

        })
        if (txt.length) {
            txt += ' is typing..'
            return (<div className={css.chatTyping}>{txt}</div>)
        }
    }
    getToast() {
        if (!this.state.isConnected)
            return (<div className={"center " + css.toastContainer}>
                <div className={"center " + css.toast}>Disconnected</div>
            </div>)
        else if (this.state.chatSyncing)
            return (<div className={"center " + css.toastContainer}>
                <div className={"center " + css.toast}>Syncing..</div>
            </div>)
        else return (<div id={css.refButt} className={"center " + css.toast} onClick={() => {
            window.state.resetCacheMessages()
        }}></div>)
    }
    render() {
        if (this.state.exit)
            return (<Redirect to='/rooms' />)
        else
            return (<>
                <Header roomControls />
                {this.getToast()}
                {this.chats()}
                <ChatBar scrollBottom />
            </>)
    }
}

export default Chat