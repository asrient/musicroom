import $ from "jquery";
import React, { Component } from "react";
import { UserLink, UserCircle } from "./user.js";
import { Link, Route } from "wouter";
import css from "./roomCard.css";
import { generateRoomEmoji } from "./utils.js";


function CardContent({ onClick, room }) {
    const roomEmoji = generateRoomEmoji(room.room_id);
    const currentTrack = `${room.current_roomtrack.title} - ${room.current_roomtrack.artists}`;
    let users = room.member_friends || [];
    users = users.slice(0, 5);
    const othersCount = room.members_count - users.length;
    return (
        <div onClick={onClick} className={"center ink-dark base-semilight size-xs " + css.roomCard}>
            <div className="size-xl">{roomEmoji}</div>
            <div>
                <div className={css.roomMembers}>
                    {users.map((user, index) => <UserCircle {...user} key={user.user_id} size="1.2rem" title={user.name} style={{marginRight: '0.2rem'}} />)}
                    {users.length === 1 ? (<span>{users[0].name}</span>) : ''}
                    {othersCount > 0 && (<>&nbsp;{`+${othersCount} ${othersCount == 1 ? 'other' : 'others'}`}</>)}
                    &nbsp;<span className="ink-grey">in Room</span>
                </div>
                <div className={css.ellipseText+' hstack'}>
                <img src="/static/icons/play-dark.svg" style={{height:'1rem', marginRight: '0.2rem'}}/>
                {currentTrack}
                </div>
            </div>
        </div>
    )
}

export default function RoomCard({ room }) {
    const roomLink = "/roomPreview/" + room.room_id;

    return (
        <Link href={roomLink}>
            <CardContent room={room} />
        </Link>);
}
