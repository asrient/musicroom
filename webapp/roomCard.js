import $ from "jquery";
import React, { Component } from "react";
import { UserLink } from "./user.js";
import { Link, Route } from "wouter";
import css from "./roomCard.css";
import sharedCss from "./common.css";
import { RoomArt } from "./roomArt.js";

class RoomCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = { isMember: false }
    }
    componentDidMount() {
        var st = window.state.getState()
        if (st.room && st.room.room_id == this.props.room_id)
            this.setState({ ...this.state, isMember: true })
    }
    gettxt() {
        var members_count = this.props.members_count
        var member_friends = []
        this.props.member_friends.forEach((friend, index) => {
            if (index < 3) {
                member_friends.push(friend)
            }
        })
        var txt = []
        var othersCount = members_count - member_friends.length
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
            txt.push(<Link key="others" href={'/roomPreview/' + this.props.room_id}>{othersCount + t}</Link>)
        }
        return txt
    }
    opt() {
        if(this.state.isMember){
            return(<Link href={'/room'} className={sharedCss.redButt_s+' '+ sharedCss.butt_active+ " center"}>Joined</Link>)
        }
        else
        return(<Link href={'/roomPreview/' + this.props.room_id} className={sharedCss.redButt_s + " center"}>Join</Link>)
    }
    render() {
        var users = this.props.member_friends

        return (<div className={css.container}>
            <div className={css.hero + ' center'}>
                <RoomArt users={users} size={1} />
            </div>
            <div className={css.txt + " ink-grey size-xs base-semilight"}>{this.gettxt()}</div>
            <div className="center">
                {this.opt()}
            </div>
        </div>)
    }
}

export default RoomCard;