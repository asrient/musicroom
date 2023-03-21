import React, { Component } from "react";
import css from "../../room.css";


function time() {
    return new Date().getTime() / 1000
}

export default class ProgressBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = { isPaused: true, durationCompleted: 0, duration: 100 }
        this.timerID = null
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
            var isPaused = st.room.is_paused;
            var duration = st.room.current_roomtrack.duration
            if (!isPaused)
                var durationCompleted = duration - st.room.duration_to_complete + (time() - (new Date(st.room.play_start_time).getTime() / 1000))
            else
                var durationCompleted = duration - st.room.duration_to_complete
            this.setState({ ...this.state, isPaused, durationCompleted, duration })
            if (isPaused && this.timerID) {
                window.clearInterval(this.timerID);
                this.timerID = null
            }
            if (!isPaused && !this.timerID) {
                this.timerID = window.setInterval(this.progressTimer, 1000);
            }
        } else {
            this.setState({ ...this.state, isPaused: true, durationCompleted: 0, duration: 100 });
            if (this.timerID) {
                window.clearInterval(this.timerID);
                this.timerID = null;
            }
        }
    }
    componentWillUnmount() {
        this.unsub();
        if (this.timerID)
            window.clearInterval(this.timerID);
        this.timerID = null
    }
    progressTimer = () => {
        if (!this.state.isPaused) {
            var durationCompleted = this.state.durationCompleted + 1
            this.setState({ ...this.state, durationCompleted })
        }
    }
    render() {
        var progress = (this.state.durationCompleted / this.state.duration) * 100
        var fillStyle = { width: progress + '%' }
        return (<div id={css.pBar}>
            <div id={css.pbar_fill} style={fillStyle} ></div>
        </div>)
    }
}