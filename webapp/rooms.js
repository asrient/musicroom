import $ from "jquery";
import React, { Component } from "react";
import RoomCard from "./roomCard.js";
import { Link, Route } from "wouter";
import css from "./rooms.css";


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

    roomCards() {
        var list = [];
        this.state.rooms.forEach(room => {
            list.push(<div key={room.room_id} className={css.item + " center"}><RoomCard room={room} /></div>)
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
            {this.showRooms()}
        </>)
    }
}

export default Rooms;