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
    }
    render() {
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
}

const LinkContent = ({ onClick, href, disableLink, size, isMe, user, originalOnClick, addText }) => {
    // onclick is passed by Link, calling it will navigate to the link

    var textStyle = {};
    if (size) {
        textStyle.fontSize = `calc(${size} - 0.3rem)`;
    }

    const text = user.name + (isMe ? ' (Me)' : '');

    const onClickHtml = (e) => {
        if (!!originalOnClick) {
            originalOnClick({ user, openProfilePage: () => onClick(e), href });
        } else if (!disableLink) {
            onClick(e);
        }
    }
    return (<div className={css.content}>
            <UserCircle {...user} size={size} noclick className={css.avatar} onClick={onClickHtml} />
            <div className={css.userName + " base-semilight"} style={textStyle}>
            <span className={!disableLink && css.link} onClick={onClickHtml}>{text}</span> {addText}
            </div>
    </div>)
}

function UserItem({ user, onClick, children, isMe, style, ...props }) {
    const originalOnClick = onClick;
    const link = isMe ? '/account' : '/profile/' + user.user_id;

    return (<div className={css.userContainer} style={style || {}}>
        <Link href={link}><LinkContent originalOnClick={originalOnClick} user={user} isMe={isMe} {...props} /></Link>
        <div>{children}</div>
    </div>)
}

export { UserLink, UserItem, UserCircle };