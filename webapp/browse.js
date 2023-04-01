import $ from "jquery";
import React, { useEffect, useState } from "react";
import RoomCard from "./roomCard.js";
import { Link, Route } from "wouter";
import css from "./rooms.css";
import { TrackListDefault } from "./track";


export function ExploreSections({ apiUrl }) {

    const [sections, setSections] = useState(null);
    const [refreshing, setRefreshing] = useState(null);

    useEffect(() => {
        api.get(apiUrl, null, (status, data) => {
            if (status == 200) {
                setSections(data.result);
            }
            else {
                console.error(status, data);
            }
        })
    }, []);

    const onRefresh = (secTitle, url) => {
        if(refreshing == secTitle) return;
        console.log('refreshing..', secTitle, url);
        setRefreshing(secTitle);
        api.get(url, null, (status, data) => {
            if (status == 200) {
                const newSections = sections.map(section => {
                    if (section.title == secTitle) {
                        return data.result[0];
                    }
                    return section;
                })
                setSections(newSections);
            }
            else {
                console.error(status, data);
            }
            setRefreshing(null);
        });
    };

    return (
        <>
        <br/>
            {sections && sections.map(section => {
                return (
                    <div key={section.title}>
                    <div className={css.secTitle}>
                        <h1>{section.title}</h1>
                        {
                        section.refresh_url && <button className="button ink-grey size-xs bg base-light" onClick={() => onRefresh(section.title, section.refresh_url)}>
                        { refreshing === section.title ? 'Refreshing..': 'REFRESH'}
                        </button>
                    }
                    </div>
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


export class Rooms extends React.Component {
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

    render() {
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
}

export default function ExplorePage() {
    return (<>
        <Rooms/>
        <ExploreSections apiUrl='tracks/explore' />
    </>);
}
