import $ from "jquery";
import React, { Component } from "react";
import { Link, Route } from "wouter";
import css from "./track.css";


class TrackItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
    }
    click = () => {
        if (this.props.onClick) {
            this.props.onClick(this.props.track_id)
        }
    }
    duration() {

        if (!this.props.playing)
            return (<div className={css.duration}>{this.props.duration}</div>)

    }
    playButt(){
        if (this.props.playable) {
            return(<img className={css.playButt+' icon size-m'} src='/static/icons/play.png' />)
        }
        else{
            return(<div></div>)
        }
    }
    render() {
        var contCls = css.trackContainer;
        if (this.props.playing) {
            contCls += ' ' + css.playing
        }
        if (this.props.playable) {
            contCls += ' ' + css.playable
        }
        var artStyles={}
        if(this.props.image_url){
            artStyles['backgroundImage']='url('+this.props.image_url+')';
        }
        return (<div className={contCls}>
            <div className={'ink-white ' + css.content} onClick={this.click}>
                <div className={css.art+' center'} style={artStyles}>{this.playButt()}</div>
                <div>
                    <div className={css.title + " base-semilight trunc"}>{this.props.title}</div>
                    <div className={css.artists + " ink-grey base-light trunc"}>{this.props.artists}</div>
                </div>
            </div>
            <div className={css.opts} style={{ alignItems: 'center', display: 'flex' }}>
                {this.duration()}
                {this.props.children}
            </div>
        </div>)
    }
}

export { TrackItem };