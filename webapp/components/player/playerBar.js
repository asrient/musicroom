import React, { Component, useState } from "react";
import { Link, Route } from "wouter";
import css from "./playerBar.css";
import ForScreen from "../forScreen";
import { useSelector } from 'react-redux';
import Popup from 'reactjs-popup';
import { currentScreenType } from "../../utils";
import Queue from "./queue";
import ProgressBar from "./progressBar";
import RoomControlPannel from "./roomControl";


function SongInfo({ image_url, title, artists, onClick, innerRef }) {
  return (
    <div className={css.si}>
      <img className={css.si_img} src={image_url || "/static/icons/default-art.png"} onClick={onClick} />
      <div className={css.si_txt} ref={innerRef} onClick={onClick}>
        <div className={css.si_txt1}>{title || 'Not Playing'}</div>
        <div className={css.si_txt2}>{artists}</div>
      </div>
    </div>
  );
}

function IconButton({ url, size, title, onClick, noChroming, isDisabled, innerRef, color }) {
  const style = {};
  if (isDisabled) {
    style.opacity = 0.5;
    style.cursor = 'not-allowed';
  }
  if (!!color && currentScreenType() === 'desktop') {
    style.backgroundColor = color;
  }
  if (noChroming) {
    style.background = 'none';
  }
  return (
    <div ref={innerRef} className={css.ib} onClick={isDisabled ? null : onClick} style={style} title={title}>
      <img className={css.ib_icon + ' size-' + size} src={url} />
    </div>
  );
};

function TextButton({ size, text, onClick }) {
  return (
    <div className={css.ib + ' size-' + size} onClick={onClick}>
      {text}
    </div>
  );
};

function MusicControl({ isPlaying, onClick, isDisabled }) {
  return (
    <div className={css.mc}>
      <div className={css.desktop_only}>
        <IconButton isDisabled={isDisabled} size="s" url="/static/icons/playPrevious.svg" title="Previous Song" noChroming={true} onClick={() => onClick('prev')} />
      </div>
      <IconButton isDisabled={isDisabled} size="s" url={isPlaying ? "/static/icons/pause.svg" : "/static/icons/play.svg"} title={isPlaying ? "Pause" : "Play"} onClick={() => onClick(isPlaying ? 'pause' : 'play')} />
      <IconButton isDisabled={isDisabled} size="s" url="/static/icons/playNext.svg" title="Next Song" noChroming={true} onClick={() => onClick('next')} />
    </div>
  );
}


const arrowStyle = { color: '#2B2B2B' }; // style for an svg element

function Pannel({ children, content, desktopWidth }) {
  const style = {};
  if (currentScreenType() == 'desktop') {
    style.width = desktopWidth || '22rem';
  } else {
    style.width = '100%';
    style.height = '100%';
  }
  return (<Popup trigger={children}
    {...{arrowStyle}}
    contentStyle={style}
    modal={currentScreenType() == 'mobile'}
    position={['bottom center', 'bottom right', 'bottom left']}
    on={['click']}
    offsetY={6}
    closeOnDocumentClick
    lockScroll>
    {close => (
      <div className={css.pannel} style={style}>
      <ForScreen mobile>
        <div className={css.pannel_close} onClick={close}>
        </div>
      </ForScreen>
      <div style={{overflowY: 'auto', display: 'block', 'width': '100%'}}>
      {content(close)}
      </div>
      </div>
    )}
  </Popup>);
}

function queuePannel(close) {
  return (<>
  <div style={{height:'1.5rem'}}></div>
    <Queue close={close}/>
  </>
  );
}

function roomControlPannel(close) {
  return (<RoomControlPannel close={close}/>);
}

function Bar() {
  const currentTrack = useSelector(state => state.room?.current_roomtrack);
  const membersCount = useSelector(state => state.room?.members_count || 0);
  const roomActive = useSelector(state => !!state.room);
  const isPaused = useSelector(state => state.room ? state.room.is_paused : true);
  const joinRequestsCount = useSelector(state => state.room ? state.room.join_request_ids.length : 0);

  const onMusicControlClick = (e) => {
    console.log('music control', e);
    switch (e) {
      case 'play':
        window.state.play();
        break;
      case 'pause':
        window.state.pause();
        break;
      case 'next':
        break;
      case 'prev':
        break;
    }
  }

  const controlRoomColor = roomActive ? joinRequestsCount>0 ? '#c99915' : membersCount>1 ? '#4EB74C': null : null;

  const QueueButton = React.forwardRef((props, ref) => (
    <IconButton innerRef={ref} {...props} isDisabled={!roomActive} size="s" url="/static/icons/queue-music.svg" title="Songs queue" />
  ));

  const RoomControlButton = React.forwardRef((props, ref) => (
    <IconButton innerRef={ref} {...props} color={controlRoomColor} size="s" url="/static/icons/roomControl.svg" title="Room Control" />
  ));

  return (
    <div className={css.bar}>
      <div className={css.bar_d_sec1}>
        <div className={css.roomIcon}><TextButton text="🎸" size="s" /></div>
        <div className={css.controlsContainer}>
          <MusicControl isDisabled={!roomActive} isPlaying={!isPaused} onClick={onMusicControlClick} />
        </div>
      </div>
      <div className={css.bar_d_sec2}>
        <SongInfo {...currentTrack} />
        <div className={css.queue_container}>
          <Pannel
            content={queuePannel}>
            <QueueButton />
          </Pannel>
        </div>
        <ProgressBar/>
      </div>
      <div className={css.bar_d_sec3}>
        {roomActive && membersCount>1 && <IconButton size="s" url="/static/icons/chat.svg" title="Chat" />}
        <Pannel desktopWidth={'18rem'} content={roomControlPannel}>
          <RoomControlButton />
        </Pannel>
        <div className={css.mobile_only}>
          <MusicControl isDisabled={!roomActive} isPlaying={!isPaused} onClick={onMusicControlClick} />
        </div>
      </div>
    </div>
  );
}


export default function PlayerBar() {
  return (
    <>
      <Bar />
      <div className={css.spacer}></div>
    </>
  );
}
