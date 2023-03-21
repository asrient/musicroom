import React, { Component } from "react";
import { Link, Route, Redirect } from "wouter";
import css from "./user.css";
import {generateUserColor} from "./utils";


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

function UserCircleLink({myUserId, ...props}) {
    return (<Link href={myUserId==props.user_id ? "/account" : "/profile/" + props.user_id}>
        <UserCircle {...props} />
    </Link>)
}

function UserCircle(props) {
    let styles = {};
    if (props.avatar_url) {
        styles.backgroundImage = 'url(' + props.avatar_url + ')'
    } else {
        styles.backgroundImage = 'none';
        styles.backgroundColor = generateUserColor(props.user_id);
    }
    if (props.size) {
        styles.height = props.size;
        styles.width = props.size;
    }
    if (props.style) {
        styles = { ...styles, ...props.style }
    }
    if((styles.height || styles.width) && !styles.fontSize){
        styles.fontSize = `calc(${styles.height} * 0.7)`;
    }
    var cls = css.circle + ' ' + props.className
    if (!props.noclick) {
        cls += ' ' + css.clickEffects;
    }
    const initials = props.name ? props.name[0].toUpperCase() : '';
    return (<div key={props.user_id}
        style={styles}
        onClick={props.onClick}
        title={props.title}
        className={cls}>
        {!props.avatar_url && (initials || props.children)}
    </div>)
}

const LinkContent = ({ onClick, href, disableLink, size, isMe, user, originalOnClick, addText }) => {
    // onclick is passed by Link, calling it will navigate to the link

    var textStyle = {};
    if (size) {
        textStyle.fontSize = `calc(${size} - 0.3rem)`;
    }

    const text = user.name + (isMe ? ' (You)' : '');

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

export { UserLink, UserItem, UserCircle, UserCircleLink };