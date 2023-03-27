import React, { useState, useEffect } from "react";
import { TrackItem, TrackListDefault } from "../../track.js";
import { Link, Redirect } from "wouter";
import { useSelector } from 'react-redux';


export default function Library(){
    const [tracks, setTracks] = useState(null);
    const currentTrack = useSelector(state => state.room?.current_roomtrack);

    useEffect(() => {
        window.state.getLibraryTracks().then((tracks) => {
            setTracks(tracks);
        }).catch((err) => {
            console.error(err);
        });
    }, []);

    return (
        <div style={{maxWidth: '65rem', margin: '0px auto'}}>
        <div className="ink-white base-semibold size-xl" style={{ padding: '2rem 1rem' }}>Your Library</div>
        {tracks ? (<div>
        {<TrackListDefault tracks={tracks} currentTrackId={currentTrack?.track_id} uid='library' stretch />}
        </div>): (<div className="center size-s" style={{ paddingTop: '4rem' }}>Loading..</div>)}
    </div>)
}

