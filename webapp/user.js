import $ from "jquery";
import React, { Component } from "react";
import Header from "./header.js";
import { Link, Route, Redirect } from "wouter";
import css from "./user.css";

class UserLink extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
    }
    render() {
        return (<Link href={"/profile/" + this.props.user_id}
            className={css.link + ' ' + this.props.className + ' trunc'}>{this.props.name}</Link>)
    }
}

class UserCircle extends React.Component {
    constructor(props) {
        super(props);
        this.state = { redirect: false, text: null, isTyping: false }
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
            const user_id = this.props.user_id
            var msgs = st.messages
            var txt = null
            for (var i = msgs.length - 1; i >= 0; i--) {
                if (msgs[i].from.user_id == user_id) {
                    txt = msgs[i].text;
                    break;
                }
            }
            var isTyping = user_id in st.typingUsers;
            this.setState({ ...this.state, text: txt, isTyping })
        }
    }
    componentWillUnmount() {
        this.unsub();
    }
    popup() {
        if (!this.props.nopopup) {
            if (this.state.text) {
                var cls = css.popup
                if (this.props.popupClass) {
                    cls += ' ' + this.props.popupClass
                }
                return (<div className={cls}>
                    <div className={css.popupTxt}>
                        {this.state.text}
                    </div>
                </div>)
            }
            else if (this.state.isTyping) {
                var cls = css['typing-indicator']
                if (this.props.popupClass) {
                    cls += ' ' + this.props.popupClass
                }
                return (<div className={cls}>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>)
            }
        }
    }
    onClick = () => {
        if (!this.props.noclick) {
            this.setState({ ...this.state, redirect: true })
        }
    }
    main() {
        var styles = {}
        if (this.props.avatar_url) {
            styles.backgroundImage = 'url(' + this.props.avatar_url + ')'
        }
        if (this.props.size) {
            styles.height = this.props.size;
            styles.width = this.props.size;
        }
        if (this.props.style) {
            styles = { ...styles, ...this.props.style }
        }
        var cls = css.circle + ' ' + this.props.className
        if (!this.props.noclick) {
            cls += ' ' + css.clickEffects
        }
        return (<div key={this.props.user_id}
            style={styles}
            onClick={this.onClick}
            className={cls}>
        </div>)
    }
    render() {
        if (this.state.redirect) {
            return (<Redirect to={'/profile/' + this.props.user_id} />)
        }
        else
            return (<div className={css.circleContainer}>
                {this.main()}
                {this.popup()}
            </div>)
    }
}

class UserItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
    }
    render() {
        var avatarStyle = {}
        if (this.props.avatar_url) {
            avatarStyle.backgroundImage = 'url(' + this.props.avatar_url + ')'
        }
        return (<div className={css.userContainer}>
            <div className={css.content}>
                <div>
                    <UserCircle nopopup {...this.props} className={css.avatar} />
                </div>
                <div>
                    <Link href={"/profile/" + this.props.user_id} className={css.userName + " ink-white base-semilight trunc"}>{this.props.name}</Link>
                </div>
            </div>
            <div>{this.props.children}</div>
        </div>)
    }
}

export { UserLink, UserItem, UserCircle };