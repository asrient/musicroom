import $ from "jquery";
import React, { useState } from "react";
import { Link, Route } from "wouter";
import css from "./track.css";
import { durationFormat } from "./utils.js";
import { IconButton, TextButton } from "./components/common/button";
import ForScreen from "./components/forScreen";
import { useSelector } from 'react-redux';
import { useContextMenu, Menu, Item, Separator } from "react-contexify";


export function TrackItem({ onClick, track_id, title, artists, duration, image_url, playing, playable, children, stretch, onMenu }) {
    const click = (e) => {
        if (onClick) {
            onClick(track_id, e)
        }
    }

    const onContextMenu = (e) => {
        onMenu && onMenu(track_id, e);
    }

    const printDuration = () => {
        return (
        <>
        <ForScreen desktop><div className={css.duration}>{durationFormat(duration)}</div></ForScreen>
        <ForScreen mobile>
        <IconButton url='/static/icons/more.svg' size='s' title='More options' onClick={onContextMenu} />
        </ForScreen>
        </>)
    }

    const playButt = () => {
        if (playable && !playing) {
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
    const contStyle = {}

    if (stretch) {
        contStyle['width'] = '100%';
        contStyle['maxWidth'] = '100%';
    }

    if (image_url) {
        artStyles['backgroundImage'] = 'url(' + image_url + ')';
    }
    return (<div className={contCls} style={contStyle} onContextMenu={onContextMenu}>
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

export function TrackList({ tracks, currentTrackId, onClick, playable, childrenMap, stretch, onMenu }) {
    const trackItems = tracks.map((track, index) => {
        return (<TrackItem key={track.track_id} onClick={onClick} playing={currentTrackId == track.track_id} playable={playable} stretch={stretch} 
        onMenu={onMenu}
        {...track} >
            {childrenMap && childrenMap(track)}
        </TrackItem>)
    })
    return (<>
        {trackItems}
    </>)
}

export function TrackListDefault({ tracks, currentTrackId, stretch, uid }) {
    uid = uid || 'tracklist';
    const { show } = useContextMenu({
        id: uid
    });
    
    const [selectedTrack, setSelectedTrack] = useState(null);

    const roomActive = useSelector(state => !!state.room);

    const onClick = (trackId) => {
        window.state.playTrack(trackId);
    }

    const addToQueue = (trackId) => {
        if(!roomActive) return;
        window.state.addTrackToRoom(trackId, false);
    }

    const likeTrack = () => {
        window.state.likeTrack(selectedTrack.track_id);
    }

    const unlikeTrack = () => {
        window.state.unlikeTrack(selectedTrack.track_id);
    }

    const childrenMap = (track) => {
        return roomActive && (<ForScreen desktop>
            <IconButton url='/static/icons/playlist-add.svg' size='s' title='Add to queue' onClick={() => addToQueue(track.track_id)} />
        </ForScreen>);
    };

    function displayMenu(trackId, e){
        // put whatever custom logic you need
        // you can even decide to not display the Menu
        setSelectedTrack(tracks.find(t => t.track_id == trackId));
        show({
          event: e,
        });
    }

    return (<>
        <Menu key='context-menu' style={{'width': 'max-content'}} id={uid}>
        <Item onClick={() => onClick(selectedTrack.track_id)}>
          Play
        </Item>
        <Item disabled={!roomActive} onClick={() => addToQueue(selectedTrack.track_id)}>
          Add to Queue
        </Item>
        <Separator />
        {selectedTrack ? <Item onClick={selectedTrack.liked ? unlikeTrack : likeTrack}>{selectedTrack.liked ? 'Remove from library' : 'Like'}</Item> : ''}
      </Menu>
        <TrackList tracks={tracks} currentTrackId={currentTrackId} playable onClick={onClick} childrenMap={childrenMap} onMenu={displayMenu} stretch={stretch} />
    </>)
}
