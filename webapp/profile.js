import $ from "jquery";
import React, { Component } from "react";
import Header from "./header.js";
import {UserCircle} from "./user.js";
import RoomCard from "./roomCard.js";
import { Link, Route } from "wouter";
import css from "./profile.css";

class Profile extends React.Component {
    constructor(props) {
        super(props);
        this.state = { profile: null, isFstatusLoading: true, error: null }
    }
    load() {
        api.post('profile', { user_id: this.props.user_id }, (status, data) => {
            if (status == 200) {
                //data.friendship_status = 1
                this.setState({ ...this.state, profile: data, isFstatusLoading: false })
            }
            else {
                console.error(status, data)
                if (status == 400) {
                    this.setState({ ...this.state, error: data.msg })
                }
            }
        })
    }
    componentDidMount() {
        this.load()
    }
    avatar() {
        var opts={}
        if (this.state.profile) {
        opts=this.state.profile
        }
        return(<UserCircle size="7rem" {...opts} noclick style={{margin:'1rem'}} />)
    }
    name() {
        if (this.state.profile) {
            return (this.state.profile.name)
        }
        else {
            return ("House Mate")
        }
    }
    changeFriendship(type = 'add') {
        this.setState({ ...this.state, isFstatusLoading: true })
        api.post('friends/' + type, { user_id: this.props.user_id }, (status, data) => {
            if (status == 201) {
                var code = data.friendship_status
                var profile = { ...this.state.profile, friendship_status: code }
                this.setState({ ...this.state, profile, isFstatusLoading: false })
                this.load()
            }
            else {
                console.error(status, data)
                this.setState({ ...this.state, isFstatusLoading: false })
            }
        })
    }
    friendship() {
        if (this.state.profile && !this.state.isFstatusLoading) {
            var code = this.state.profile.friendship_status
            if (code == 3) {
                return (<div id={css.f_status} onClick={() => { this.changeFriendship('remove') }}>friends</div>)
            }
            else if (code == 2) {
                return (<div>
                    <br />
                    <div className="ink-grey size-xs base-regular" style={{ paddingBottom: '0.5rem' }}>Added you!</div>
                    <div className="center ink-white">
                        <div className="button blue" onClick={() => { this.changeFriendship() }}>Accept</div>
                        <div className="button grey" onClick={() => { this.changeFriendship('remove') }}>Ignore</div>
                    </div>
                </div>)
            }
            else if (code == 1) {
                return (<div id={css.f_status} onClick={() => { this.changeFriendship('remove') }}>requested</div>)
            }
            else {
                return (<div id="f_butt" className="button rounded blue ink-white"
                    onClick={() => { this.changeFriendship() }}>Add</div>)
            }
        }
        else {
            return (<div>loading</div>)
        }
    }
    room() {
        if (this.state.profile) {
            if (this.state.profile.room) {
                return (<div className="center" style={{ padding: '2rem 0.5rem' }}>
                    <RoomCard {...this.state.profile.room} />
                </div>)
            }
            else {
                return (<div></div>)
            }
        }
        else {
            return (<div></div>)
        }
    }
    main(){
        if(this.state.error){
            return(<div className="center container ink-light base-regular size-l" style={{padding:'3rem 1rem'}}>
                {this.state.error}
            </div>)
        }
        else{
            return(<div className="container center-col">
            <br />
            <br />
            <div>{this.avatar()}</div>
            <div className="size-m ink-white base-regular">{this.name()}</div>
            <div style={{ padding: '0.5rem' }}>{this.friendship()}</div>
            {this.room()}
        </div>)
        }
    }
    render() {
        return (<>
            <Header blank />
            {this.main()}
        </>)
    }
}

export default Profile;