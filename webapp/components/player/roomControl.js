import React, { Component, useState, useEffect } from "react";
import css from './roomControl.css';
import { useSelector } from 'react-redux';
import ForScreen from "../forScreen";
import Switch from 'react-ios-switch';
import { UserItem } from "../../user.js";


function RoomMembers({ members, myUserId, closePannel }) {
    const allMembers = [...members.friends, ...members.others];
    const count = allMembers.length;
    return (
        <div>
            <div className="size-xs base-regular" style={{ marginBottom: '0.4rem' }}>Room Members {`(${count})`}</div>
            {allMembers.map((user, index) => {
                return (
                    <UserItem key={user.user_id} user={user} isMe={user.user_id === myUserId} size='1.2rem'
                        onClick={({ openProfilePage }) => {
                            closePannel();
                            openProfilePage();
                        }} />
                )
            })}
        </div>
    );
}

function JoinRequest({ user, respond, closePannel }) {
    const [processing, setProcessing] = useState(false);
    const onApprove = () => {
        if (processing) return;
        setProcessing(true);
        respond(user.user_id, true);
    }
    const onReject = () => {
        if (processing) return;
        setProcessing(true);
        respond(user.user_id, false);
    }
    return (
        <UserItem key={user.user_id} user={user} size='1.2rem'
            style={{ flexDirection: 'column', alignItems: 'flex-start' }}
            addText={<span className="ink-grey" style={{ fontSize: '0.7rem' }}>wants to join you.</span>}
            onClick={({ openProfilePage }) => {
                closePannel();
                openProfilePage();
            }} >
            {
                processing ? <div className="ink-white center" style={{ fontSize: '0.7rem' }}>Processing...</div> :
                    <div className={css.joinActions}>
                        <div className="button size-xs ink-primary" onClick={onReject}>Deny</div>
                        <div className="button blue size-xs ink-white" onClick={onApprove}>Allow</div>
                    </div>
            }
        </UserItem>
    )
}


function JoinRequests({ room_id, closePannel }) {
    const [joinRequests, setJoinRequests] = useState(null);

    useEffect(() => {
        async function fetchJoinRequests() {
            const joinRequests_ = await window.state.getJoinRequests();
            setJoinRequests(joinRequests_.users);
            window.state.markRequestsAsSeen();
        }
        if (!!room_id) {
            fetchJoinRequests();
        }
    }, [room_id]);

    const respond = (user_id, accept) => {
        async function respond() {
            try {
                await window.state.respondJoinRoom(user_id, accept);
                setJoinRequests(joinRequests.filter(user => user.user_id !== user_id));
            } catch (e) {
                console.error(e);
            }
        }
        respond();
    }

    if (!joinRequests) return null;
    const count = joinRequests.length;
    if(count === 0) return null;

    return (
        <div>
            <div className="size-xs base-regular" style={{ marginBottom: '0.4rem' }}>Join Requests {`(${count})`}</div>
            {joinRequests.map((user, index) => <JoinRequest key={user.user_id} user={user} respond={respond} />)}
            <br/>
        </div>
    );
}

export default function RoomControlPannel({ close }) {
    const members = useSelector(state => state.room?.members || 0); // {friends, others}
    const room_id = useSelector(state => state.room?.room_id);
    const myUserId = useSelector(state => state.me.user_id);
    const inviteCode = useSelector(state => state.room?.room_code);
    const requestedRoom = useSelector(state => state.room?.room_code);
    const room_visible_to_friends = useSelector(state => state.user_preferences.room_visible_to_friends);
    const [isExiting, setIsExiting] = useState(false);
    const [settingLoading, setSettingLoading] = useState(false);

    const exitRoom = () => {
        async function exit() {
            try {
                await window.state.leaveRoom();
            } catch (e) {
                console.error(e);
            } finally {
                setIsExiting(false);
            }
        }
        if (!room_id) return;
        if (isExiting) return;
        setIsExiting(true);
        exit();
    };

    const toggleRoomVisibility = (checked) => {
        async function toggle() {
            try {
                await window.state.setUserPreference('room_visible_to_friends', checked);
            } catch (e) {
                console.error(e);
            } finally {
                setSettingLoading(false);
            }
        }
        if (!room_id) return;
        if (settingLoading) return;
        if (checked === room_visible_to_friends) return;
        setSettingLoading(true);
        toggle();
    };


    return (<div className={css.main + " ink-grey base-light"}>
        <div>
            <ForScreen mobile>
                <div style={{ height: '2.5rem' }}></div>
            </ForScreen>
            <div className={css.title}>
                <img className="icon size-l" src="/static/icons/roomControl.svg" />
                RoomPlay
            </div>
            <hr className={css.hr} />
            {!!room_id ? (<>
                <div className={css.row}>
                    <div className={css.subTitle}>Invite Code</div>
                    <div className={css.code} title="Copy to clipboard" onClick={() => window.state.codeExport()}>{inviteCode}</div>
                </div>
                <div className={css.row + ' ' + css.chrome}>
                    <div className={css.subTitle}>Visible to friends</div>
                    <Switch
                        style={{ transform: 'scale(0.7)' }}
                        checked={room_visible_to_friends}
                        readOnly={settingLoading}
                        offColor="grey"
                        onChange={toggleRoomVisibility} />
                </div>
                <br />
                <JoinRequests room_id={room_id} closePannel={close} />
                <RoomMembers members={members} myUserId={myUserId} closePannel={close} />
            </>) : (<div className="center">Play a music to create a room.</div>)}
        </div>
        {!!room_id ? (<div>
            <button className="ink-red button size-xs strech" style={{ maxWidth: '18rem' }} onClick={exitRoom}>
                {isExiting ? 'Exiting..' : 'Exit Room'}
            </button>
            <ForScreen mobile>
                <div style={{ height: '1.2rem' }}></div>
            </ForScreen>
        </div>) : null}
    </div>);
};
