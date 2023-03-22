import React, { Component } from "react";
import { TrackItem } from "../../track.js";
import { Link, Redirect } from "wouter";
import css from "../../room.css";
import sharedCss from "../../common.css";
import { IconButton } from "../common/button";


export default class Queue extends React.Component {
    constructor(props) {
        super(props);
        this.state = { tracks: null, currentTrack: null }
    }
    componentDidMount() {
        this.parseState();
        this.unsub = window.state.subscribe(() => {
            this.parseState();
        })
    }
    parseState() {
        var st = window.state.getState();
        if (st.room) {
            this.setState({ ...this.state, tracks: st.room.tracks, currentTrack: st.room.current_roomtrack })
        }
    }
    componentWillUnmount() {
        this.unsub();
    }
    closePannel = () => {
        if(this.props.close)
            this.props.close();
    }
    list() {
        if (this.state.tracks) {
            var tracks = this.state.tracks
            var currentTrack = this.state.currentTrack
            var arranged = []
            var currInd = tracks.findIndex((track) => { return track.roomtrack_id == currentTrack.roomtrack_id })
            if (currInd != undefined) {
                var counter = currInd;
                for (var i = 0; i < tracks.length; i++) {
                    if (counter >= tracks.length) {
                        counter = 0
                    }
                    if (counter != currInd) {
                        arranged.push(tracks[counter])
                    }
                    counter++;
                }
            }
            else {
                console.error('current track not found in tracks')
                arranged = tracks
            }
            var list = []
            arranged.forEach(track => {
                list.push(<TrackItem onClick={() => {
                    window.state.skipTo(track.roomtrack_id)
                }} playable key={track.roomtrack_id} {...track} >
                    <IconButton url='/static/icons/playlist-remove.svg' size='s' title='Remove' onClick={() => window.state.removeTrack(track.roomtrack_id)} />
                </TrackItem>)
            });
            return (<div>
                <div style={{ paddingLeft: '2rem', paddingBottom: '0.6rem' }}
                    className='container size-m ink-light base-semibold'>
                    Up next
                </div>
                {list.length ? list : <div className='center size-s ink-light base-light' style={{marginTop:'2rem'}}>No tracks</div>}
            </div>)
        }
        else {
            return (<div>Loading tracks..</div>)
        }
    }
    render() {
        if (this.state.exit)
            return (<Redirect to='/browse' />)
        else
            return (<div>
                {this.list()}
                <div className="center-col" style={{ padding: '1.3rem 0.3rem' }}>
                    <div style={{ paddingTop: '0.6rem' }} className="center">
                        <Link href='/room/addTracks' onClick={() => {
                            this.closePannel();
                        }} className={sharedCss.redButt_s + ' center'}>Add more</Link>
                    </div>
                </div>
                <br />
            </div>)
    }
}