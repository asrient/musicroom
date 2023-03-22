import $ from "jquery";
import React, { Component } from "react";
import { Link, Route } from "wouter";
import css from "./track.css";
import { durationFormat } from "./utils.js";
import { IconButton, TextButton } from "./components/common/button";


export function TrackItem({ onClick, track_id, title, artists, duration, image_url, playing, playable, children }) {
    const click = () => {
        if (onClick) {
            onClick(track_id)
        }
    }
    const printDuration = () => {
        if (!playing)
            return (<div className={css.duration}>{durationFormat(duration)}</div>)

    }
    const playButt = () => {
        if (playable) {
            return (<img className={css.playButt + ' icon size-m'} src='/static/icons/play.png' />)
        }
        else {
            return (<div></div>)
        }
    }
    var contCls = css.trackContainer;
    if (playing) {
        contCls += ' ' + css.playing
    }
    if (playable) {
        contCls += ' ' + css.playable
    }
    var artStyles = {}
    if (image_url) {
        artStyles['backgroundImage'] = 'url(' + image_url + ')';
    }
    return (<div className={contCls}>
        <div className={'ink-white ' + css.content} onClick={click}>
            <div className={css.art + ' center'} style={artStyles}>{playButt()}</div>
            <div>
                <div className={css.title + " base-semilight trunc"}>{title}</div>
                <div className={css.artists + " ink-grey base-light trunc"}>{artists}</div>
            </div>
        </div>
        <div className={css.opts} style={{ alignItems: 'center', display: 'flex' }}>
            {printDuration()}
            {children}
        </div>
    </div>)
}

export function TrackList({ tracks, currentTrackId, onClick, playable, childrenMap }) {
    const trackItems = tracks.map((track, index) => {
        return (<TrackItem key={track.track_id} onClick={onClick} playing={currentTrackId == track.track_id} playable={playable} {...track} >
            {childrenMap && childrenMap(track)}
        </TrackItem>)
    })
    return (<>
        {trackItems}
    </>)
}

export function TrackListDefault({ tracks, currentTrackId }) {

    const onClick = (trackId) => {
        window.state.playTrack(trackId);
    }

    const addToQueue = (trackId) => {
        window.state.addTrackToRoom(trackId, false);
    }

    const childrenMap = (track) => {
        return (<IconButton url='/static/icons/playlist-add.svg' size='s' title='Add to queue' onClick={() => addToQueue(track.track_id)} />)
    };

    return (<TrackList tracks={tracks} currentTrackId={currentTrackId} playable onClick={onClick} childrenMap={childrenMap} />)
}
