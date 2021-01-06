import $ from "jquery";
import React, { Component } from "react";
import { Link, Route } from "wouter";

class Header extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
    }
    componentDidMount() {
    }
    getChatOpt() {
        if (window.location.pathname == '/room')
            return (<Link className="hd_opt" href="/room/chat">Chat</Link>)
    }
    getRoomOpt() {
        var st = window.state.getState()
        if (!this.props.roomControls){
            if(st.room)
            return (<Link className="hd_opt" id="hd_room_opt" href="/room">Room</Link>)
            else
                return(<a className="hd_opt" href="/joinRoom">Join room</a>)
        }
    }
    showOpts() {
        if (!this.props.blank) {
            if (!this.props.roomControls)
                return (<div id="hd_opts" className="hstack space-around">
                    {this.getRoomOpt()}
                    <Link className="hd_opt" href="/account">Account</Link>
                </div>)
            else
                return (<div id="hd_opts" className="hstack space-around">
                    {this.getChatOpt()}
                    <Link className="hd_opt" href="/room/access">Access</Link>
                    <div className="hd_opt red_opt" onClick={() => { window.state.leaveRoom() }}>
                        &nbsp;LEAVE&nbsp;
                    </div>
                </div>)
        }
        else {
            return (<div></div>)
        }
    }
    render() {
        return (<>
            <div id="header">
                <Link id="hd_hero" href="/rooms"><img style={{ marginLeft: '0.6rem' }} id="hd_mrIcon" src="/static/icons/mr.png" /></Link>
                {this.showOpts()}
            </div>
            <div id="hd_space"></div>
        </>)
    }
}

export default Header;