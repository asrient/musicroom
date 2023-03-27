import $ from "jquery";
import React, { useEffect, useState } from "react";
import RoomCard from "./roomCard.js";
import { Link, Route } from "wouter";
import css from "./rooms.css";
import { TrackListDefault } from "./track";


function ExploreSections() {

    const [sections, setSections] = useState(null);

    useEffect(() => {
        api.get('tracks/explore', null, (status, data) => {
            if (status == 200) {
                setSections(data.result);
            }
            else {
                console.error(status, data);
            }
        })
    }, []);

    return (
        <>
        <br/>
            {sections && sections.map(section => {
                return (
                    <div key={section.title}>
                    <h1 className={css.secTitle}>{section.title}</h1>
                    <div className={css.trackList}>
                    <TrackListDefault tracks={section.tracks} uid={section.title} />
                    </div>
                    <br/>
                    <br/>
                    </div>
                )
            })}
        </>
    )
}


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
        if (!!this.state.rooms && this.state.rooms.length > 0) {
            return (<div id={css.grid}>{this.roomCards()}</div>)
        } else if(!!this.state.rooms) {
            return null;
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
            <ExploreSections/>
        </>)
    }
}

export default Rooms;