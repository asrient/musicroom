import $ from "jquery";
import React, { Component } from "react";
import { UserCircle } from "./user.js";
import { Link, Route } from "wouter";
import css from "./roomArt.css";

const L = 'L', M = 'M', S = 'S', XS = 'XS'

const layouts = [
    [L, M, L, M, S, L, S],
    [S, L, S, L, M, L, S],
    [M, S, L, S, M, S, L],
    [M, L, S, L, S, M, M],
    [S, L, M, S, L, S, M],
    [L, S, M, L, L, S, S],
]

const size2x = {
    L: 'l-2x',
    M: 'm-2x',
    S: 's-2x',
}

const size1x = {
    L: 'l-1x',
    M: 'm-1x',
    S: 's-1x',
}

const totalLayouts = layouts.length

class RoomArt extends React.Component {
    constructor(props) {
        super(props);
        this.state = { layoutNo: 0 }
    }
    componentDidMount() {
        if (this.props.users.length > 1) {
            this.state.layoutNo = Math.floor(Math.random() * totalLayouts)
        }
        var nextTime = Math.floor(Math.random() * 30 * 1000) + 50 * 1000
        this.timerID = this.timer(nextTime)
    }
    timer = (time) => setTimeout(() => {
        if (this.props.users.length > 1)
            this.setState({ ...this.state, layoutNo: Math.floor(Math.random() * totalLayouts) })
        var nextTime = Math.floor(Math.random() * 30 * 1000 + Math.random() * 30 * 1000) + 60 * 1000
        this.timerID = this.timer(nextTime)
    }, time);
    componentWillUnmount() {
        window.clearTimeout(this.timerID);
    }
    render() {
        var sizes = size2x
        if (this.props.size == 1) {
            sizes = size1x
        }
        var list = []
        this.props.users.forEach((user, ind) => {
            if (ind < 6){
            var cls=sizes[layouts[this.state.layoutNo][ind]]
                list.push(<UserCircle {...user} 
                    key={user.user_id} 
                    popupClass={css[cls+'-txt']}
                    className={css.item + ' ' + css[cls]} />)
                }
        })
        return (<div className={css.container}>{list}</div>)
    }
}

export { RoomArt }