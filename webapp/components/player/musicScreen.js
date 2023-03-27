import React, { Component, useEffect, useState } from "react";
import css from "./playerBar.css";
import ForScreen from "../forScreen";
import Queue from "./queue";
import ProgressBar from "./progressBar";
import { IconButton, TextButton } from "../common/button";
import LikeButton from "./likeButton";


export function MusicControl({ isPlaying, onClick, isDisabled, canHide, size }) {
    size = size || 's';
    return (
        <div className={css.mc}>
            <div className={canHide ? css.desktop_only : ''}>
                <IconButton isDisabled={isDisabled} size={size} url="/static/icons/playPrevious.svg" title="Previous Song" noChroming={true} onClick={() => onClick('prev')} />
            </div>
            <IconButton isDisabled={isDisabled} size={size} url={isPlaying ? "/static/icons/pause.svg" : "/static/icons/play.svg"} title={isPlaying ? "Pause" : "Play"} onClick={() => onClick(isPlaying ? 'pause' : 'play')} />
            <IconButton isDisabled={isDisabled} size={size} url="/static/icons/playNext.svg" title="Next Song" noChroming={true} onClick={() => onClick('next')} />
        </div>
    );
}

export function MusicScreen({ close, currentTrack, change, isPlaying }) {


    return (
        <>
        <div className={css.playerFull}>
            <div className={css.playerFull_s1}>
            <div className="center">
            <img  className={css.ms_img}
                    src={currentTrack?.image_url || "/static/icons/default-art.png"} />
            </div>
                <div className="hstack space-between">
                    <div className={css.ms_txt+" ink-white size-s"}>
                        <div className={css.si_txt1} style={{fontSize:'1.4rem',fontWeight:'400'}}>{currentTrack?.title || 'Not Playing'}</div>
                        <div className={css.si_txt2} style={{fontSize:'1rem', paddingTop: '0.3rem'}}>{currentTrack?.artists}</div>
                    </div>
                    <div className="hstack" style={{justifyContent:'flex-end'}}>
                    <LikeButton isDisabled={!currentTrack} isLoading={!currentTrack || (typeof currentTrack.liked !== 'boolean')} 
                    isLiked={ currentTrack?.liked } trackId={currentTrack?.track_id} />
                    </div>
                </div>
                <div className={css.ms_progress}>
                <ProgressBar/>
                </div>
                <MusicControl size='l' isPlaying={isPlaying} onClick={change} isDisabled={!currentTrack} canHide={false} />
            </div>
            <div>
            <ForScreen mobile>
                <hr/>
            </ForScreen>
            <Queue close={close}/>
            </div>
        </div>
        <div className={css.pannel_close} onClick={close}></div>
        </>
    );
}