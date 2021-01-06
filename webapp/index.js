import $ from "jquery";
import React, { Component } from "react";
import ReactDOM from "react-dom";
import Toasts from "./toasts.js";
import Rooms from "./rooms.js";
import Room from "./room.js";
import Chat from "./chat.js";
import Account from "./account.js";
import FriendRequests from "./FriendRequests.js";
import Friends from "./friends.js";
import RoomPreview from "./roomPreview.js";
import AddTracks from "./addTracks.js";
import RoomAccess from "./roomAccess.js";
import Profile from "./profile.js";
import { Switch, Route, Redirect } from "wouter";
import css from "./styles.css";
import state from "./state.js";

window.api = new window.Api()
window.state = state;
window.state.init();

class LoginRequired extends React.Component {
    constructor(props) {
        super(props);
        this.state = { isLoggedin: state.getState().is_loggedin }
    }
    componentDidMount() {
        if (!this.state.isLoggedin) {
            window.location.href = '/login'
        }
    }

    render() {
        if (this.state.isLoggedin)
            return (this.props.children)
        else
            return (<div>Redirecting..</div>)
    }
}

var RoomRequired = (prams) => {
    if (state.getState().room) {
        return prams.children
    }
    else {
        return (<Redirect to='/rooms' />)
    }
}
var RoomMembers = (prams) => {
        return (<RoomPreview room_id={state.getState().room.room_id} />)
}

class AutoplayBanner extends React.Component {
    constructor(props) {
        super(props);
        this.state = { show:false }
    }
    componentDidMount() {
        this.parseState();
        this.unsub = window.state.subscribe(() => {
            this.parseState();
        })
    }
    parseState() {
        var st = window.state.getState();
            this.setState({ ...this.state, show:st.showAutoplayBanner })
    }
    componentWillUnmount() {
        this.unsub();
    }
    ok=()=>{
        state.closeAutoplayBanner()
        state.syncPlayback()
    }
    render() {
        if(this.state.show){
            return(<div id={css.ap_screen} className='center'>
                <div id={css.ap_box} className='center-col'>
                    <div className='size-m ink-white base-regular'>
                        Play room music?
                    </div>
                    <br/>
                    <div onClick={this.ok} className={'redButt center '+css.ap_butt}>Play</div>
                </div>
            </div>)
        }
        else{
            return null
        }
    }
}

ReactDOM.render(<div>
    <Toasts/>
    <AutoplayBanner/>
    <Switch>
        <Route path="/rooms"><Rooms /></Route>
        <Route path="/createRoom">
            <LoginRequired>
                <AddTracks action="create-room" />
            </LoginRequired>
        </Route>
        <Route path="/account">
            <LoginRequired>
                <Account />
            </LoginRequired>
        </Route>
        <Route path="/friendRequests">
            <LoginRequired>
                <FriendRequests />
            </LoginRequired>
        </Route>
        <Route path="/friends">
            <LoginRequired>
                <Friends />
            </LoginRequired>
        </Route>
        <Route path="/room/addTracks">
            <LoginRequired>
                <RoomRequired>
                    <AddTracks action="add-tracks" />
                </RoomRequired>
            </LoginRequired>
        </Route>
        <Route path="/room">
            <LoginRequired>
                <RoomRequired>
                    <Room />
                </RoomRequired>
            </LoginRequired>
        </Route>
        <Route path="/room/chat">
            <LoginRequired>
                <RoomRequired>
                    <Chat />
                </RoomRequired>
            </LoginRequired>
        </Route>
        <Route path="/room/access">
            <LoginRequired>
                <RoomRequired>
                    <RoomAccess />
                </RoomRequired>
            </LoginRequired>
        </Route>
        <Route path="/room/members">
            <LoginRequired>
                <RoomRequired>
                    <RoomMembers/>
                </RoomRequired>
            </LoginRequired>
        </Route>
        <Route path="/profile/:id">
            {params => {
                if (state.getState().me.user_id != params.id)
                    return (<LoginRequired>
                        <Profile user_id={params.id} />
                    </LoginRequired>)
                else
                    return (<Redirect to='/account'/>)
            }}</Route>
        <Route path="/roomPreview/:id">
            {params => {
                return (<LoginRequired>
                    <RoomPreview room_id={params.id} />
                </LoginRequired>)
            }}
        </Route>
        <Route>404, Not Found!</Route>
    </Switch>
    </div>, document.getElementById('root')
);


