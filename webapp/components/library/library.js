import React, { useState, useEffect } from "react";
import { TrackItem, TrackListDefault } from "../../track.js";
import { Link, Redirect } from "wouter";
import { useSelector } from 'react-redux';


export default function Library(){
    const [isLoading, setIsLoading] = useState(true);
    const currentTrack = useSelector(state => state.room?.current_roomtrack);
    const tracks = useSelector(state => state.library);
    const isLibraryComplete = useSelector(state => state.isLibraryComplete);

    const loadTracks = () => {
        if(isLibraryComplete) return;
        window.state.loadLibraryTracks().then(() => {
            setIsLoading(false);
        }).catch((err) => {
            console.error(err);
        });
    };

    useEffect(() => {
        loadTracks();
        return () => window.state.unloadLibraryTracks();
    }, []);

    return (
        <div style={{maxWidth: '65rem', margin: '0px auto'}}>
        <div className="ink-white base-semibold size-xl" style={{ padding: '2rem 1rem' }}>Your Library</div>
        <div>
        {<TrackListDefault tracks={tracks} currentTrackId={currentTrack?.track_id} uid='library' stretch />}
        </div>
        {isLoading || tracks.length===0 ? (
            <div className="center size-s" style={{ paddingTop: '4rem' }}>
            {isLoading ? 'Loading..' : 'Pssst! Add some tracks to your library!'}
            </div>
            ) : ''}
    </div>)
}

