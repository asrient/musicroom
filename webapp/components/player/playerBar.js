import React, { Component, useEffect, useState } from "react";
import { Link, Route } from "wouter";
import css from "./playerBar.css";
import ForScreen from "../forScreen";
import { useSelector } from 'react-redux';
import Popup from 'reactjs-popup';
import { currentScreenType, generateRoomEmoji } from "../../utils";
import Queue from "./queue";
import ProgressBar from "./progressBar";
import RoomControlPannel from "./roomControl";
import { UserCircleLink, UserCircle } from "../../user";
import { IconButton, TextButton } from "../common/button";
import { MusicControl, MusicScreen } from "./musicScreen";
import Chat from "../../chat";


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

function UsersDisplay() {
  const members = useSelector(state => state.room?.members);
  const me = useSelector(state => state.me);
  const maxUsers = 3;

  const [usersToShow, setUsersToShow] = useState([]);
  const [moreUsersCount, setMoreUsersCount] = useState(0);
  
  useEffect(() => {
    if(!members) {
      setUsersToShow([me]);
      setMoreUsersCount(0);
      return;
    }
    const { friends, others } = members;
    const users = [...friends, ...others];

    const toShow = [me];
    for (let user of users) {
      if(toShow.length >= maxUsers) {
        break;
      }
      if (user.user_id != me.user_id) {
        toShow.push(user);
      }
    }
    const moreCount = users.length - toShow.length;
    setUsersToShow(toShow);
    setMoreUsersCount(moreCount);
  }, [members, me]);
  
  if(usersToShow.length<1) return null;

  return (
    <div className={'center '+css.usersDisplay} style={{paddingRight: '0.5rem'}}>
      {usersToShow.map((user, i) => (
        <div key={user.user_id} style={{paddingRight: '0.2rem'}}>
        <UserCircleLink {...user} size="1.6rem" myUserId={me.user_id} title={user.name + (me.user_id===user.user_id ? ' (You)' : '')} />
        </div>
      ))}
      {moreUsersCount > 0 && <div>
      <UserCircle name="" user_id={8} size="1.6rem" style={{fontSize: '0.7rem', fontWeight:'300'}} >
      +{moreUsersCount}
      </UserCircle></div>}
    </div>
  );
}

const arrowStyle = { color: '#2B2B2B' }; // style for an svg element
const overlayStyle = { background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)' };

function Pannel({ children, content, desktopWidth, modal }) {
  const style = {};
  if (currentScreenType() == 'desktop') {
    style.width = desktopWidth || '26rem';
  } else {
    style.width = '100%';
    style.height = '100%';
  }
  return (<Popup trigger={children}
    {...{arrowStyle, overlayStyle}}
    contentStyle={style}
    modal={currentScreenType() == 'mobile' || modal}
    position={['bottom center', 'bottom right', 'bottom left']}
    on={['click']}
    offsetY={6}
    closeOnDocumentClick
    lockScroll>
    {close => (
      <div className={css.pannel+(modal ? ' ' + css.modal:'')}>
      <ForScreen mobile>
        <div className={css.pannel_close} onClick={close}>
        </div>
      </ForScreen>
      <div style={{overflow: 'hidden', overflowY: 'auto', display: 'block', 'width': '100%'}}>
      {content(close)}
      </div>
      </div>
    )}
  </Popup>);
}

function queuePannel(close) {
  return (<>
    <Queue close={close}/>
  </>
  );
}

function roomControlPannel(close) {
  return (<RoomControlPannel close={close}/>);
}

function chatPannel(close) {
  return (<Chat close={close}/>);
}

function Bar() {
  const currentTrack = useSelector(state => state.room?.current_roomtrack);
  const membersCount = useSelector(state => state.room?.members_count || 0);
  const roomActive = useSelector(state => !!state.room);
  const roomId = useSelector(state => state.room?.room_id);
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
        window.state.playAdjacent('next');
        break;
      case 'prev':
        window.state.playAdjacent('prev');
        break;
    }
  }

  const musicScreenPannel = (close) => {
    return (<MusicScreen close={close} currentTrack={currentTrack} change={onMusicControlClick} isPlaying={!isPaused} />);
  };

  const controlRoomColor = roomActive ? joinRequestsCount>0 ? '#c99915' : membersCount>1 ? '#4EB74C': null : null;

  const QueueButton = React.forwardRef((props, ref) => (
    <IconButton innerRef={ref} {...props} isDisabled={!roomActive} size="s" url="/static/icons/queue-music.svg" title="Songs queue" />
  ));

  const RoomControlButton = React.forwardRef((props, ref) => (
    <IconButton innerRef={ref} {...props} color={controlRoomColor} size="s" url="/static/icons/roomControl.svg" title="Room Control" />
  ));

  const SongInfoWrapper = React.forwardRef((props, ref) => (
    <SongInfo innerRef={ref} {...props} />
  ));

  const ChatButton = React.forwardRef((props, ref) => (
    <IconButton innerRef={ref} {...props} size="s" url="/static/icons/chat.svg" title="Chat" />
  ));

  const roomEmoji = roomActive ? generateRoomEmoji(roomId) : '🎸';

  return (
    <div className={css.bar}>
      <div className={css.bar_d_sec1}>
        <div className={css.roomIcon}><Link href="/browse">
        <TextButton text={roomEmoji} size="s" />
        </Link></div>
        <div className={css.controlsContainer}>
          <MusicControl isDisabled={!roomActive} isPlaying={!isPaused} onClick={onMusicControlClick} />
        </div>
      </div>
      <div className={css.bar_d_sec2}>
        <Pannel
          modal
          desktopWidth={'80%'}
          content={musicScreenPannel}>
          <SongInfoWrapper {...currentTrack} />
        </Pannel>
        <div className={css.queue_container}>
          <Pannel
            content={queuePannel}>
            <QueueButton />
          </Pannel>
        </div>
        <ProgressBar/>
      </div>
      <div className={css.bar_d_sec3}>
      <ForScreen desktop>
      <UsersDisplay />
      </ForScreen>
        {roomActive && membersCount>1 
        &&(<Pannel desktopWidth={'30rem'} content={chatPannel}>
        <ChatButton />
        </Pannel>)}
        <Pannel desktopWidth={'20rem'} content={roomControlPannel}>
          <RoomControlButton />
        </Pannel>
        <div className={css.mobile_only}>
          <MusicControl isDisabled={!roomActive} canHide={true} isPlaying={!isPaused} onClick={onMusicControlClick} />
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
