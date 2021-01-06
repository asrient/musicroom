import $ from "jquery";
import React, { Component } from "react";
import Header from "./header.js";
import RoomCard from "./roomCard.js";
import { Link, Route } from "wouter";
import css from "./rooms.css";
import cardCss from "./roomCard.css";
import sharedCss from "./common.css";

class Rooms extends React.Component {
    constructor(props) {
        super(props);
        this.state = { rooms: null }
    }
    componentDidMount() {
        api.get('rooms', null, (status, data) => {
            if (status == 200) {
                this.setState({ ...this.state, rooms: data.rooms })
            }
            else {
                console.error(status, data)
            }
        })
    }
    createRoomCard() {
        return (<div key="create" className={css.item + " center"}>
            <div className={cardCss.container}>
                <div style={{ padding: '1rem' }} className="center-col size-m ink-white baser-regular">
                <div style={{paddingBottom:'0.7rem'}} className="size-xl">
                    <img src="/static/media/friends-hero.png" id={css.friendsHero} />
                </div>
                    <div>Create your own room</div>
                </div>
                <div className="center ink-grey size-xs">
                    Start the party!
                </div>
                <div className="center">
                    <Link href="/createRoom" className={sharedCss.redButt_s + " center"}>Add songs</Link>
                </div>
            </div>
        </div>
        )
    }
    roomCards() {
        var list = []
        list.push(this.createRoomCard())
        this.state.rooms.forEach(room => {
            list.push(<div key={room.room_id} className={css.item + " center"}><RoomCard {...room} /></div>)
        });
        return list
    }
    showRooms() {
        if (this.state.rooms != null) {
            return (<div id={css.grid}>{this.roomCards()}</div>)
        }
        else {
            return (<div className="center size-m base-regular" style={{ height: '10rem' }}>
                Loading
            </div>)
        }
    }
    render() {
        return (<>
            <Header />
            {this.showRooms()}
        </>)
    }
}

export default Rooms;