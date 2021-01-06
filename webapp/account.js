import $ from "jquery";
import React, { Component } from "react";
import Header from "./header.js";
import { UserLink, UserCircle } from "./user.js";
import { Link, Redirect } from "wouter";
import css from "./account.css";
import sharedCss from "./common.css";

class Account extends React.Component {
    constructor(props) {
        super(props);
        this.state = { me: null, isLoggingOut: false }
    }
    componentDidMount() {
        var st = window.state.getState()
        this.setState({ ...this.state, me: st.me })
    }
    logout = () => {
        api.get('logout', null, (code,res) => {
            this.setState({...this.state,isLoggingOut:false})
            if(code==200){
                window.location.href='/'
            }
        })
    }
    logOutTxt(){
        if(this.state.isLoggingOut)
        return("Logging out..")
        else
        return("Log Out")
    }
    main() {
        if (this.state.me)
            return (<div className={'container ' + css.container}>
                <a href="/setAvatar?src=account" className={css.opt}>
                    <div>Avatar</div>
                    <div><UserCircle {...this.state.me} noclick nopopup size="2.2rem" style={{ margin: '0px' }} /></div>
                </a>
                <a href="/setName" className={css.opt}>
                    <div>Name</div>
                    <div>{this.state.me.name}</div>
                </a>
                &nbsp;
                <Link href="/friends" className={css.opt}>
                    <div>My friends</div>
                    <div>+</div>
                </Link>
                <Link href="/friendRequests" className={css.opt}>
                    <div>Friend requests</div>
                    <div>+</div>
                </Link>
                &nbsp;
                <div className={css.opt} onClick={this.logout}>
                    <div>{this.logOutTxt()}</div>
                    <div>+</div>
                </div>
            </div>)
        else return (<div className="center ink-white size-m"
            style={{ padding: '4rem 1rem' }}>
            Loading..
        </div>)
    }
    render() {
        return (<>
            <div className="center" style={{ padding: '2rem 0.6rem' }}>
                <img src="/static/icons/mr.png" className="icon size-xxl" />
            </div>
            {this.main()}
        </>)
    }
}

export default Account