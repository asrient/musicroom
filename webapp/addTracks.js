import $ from "jquery";
import React, { Component } from "react";
import Header from "./header.js";
import { TrackItem, TrackListDefault } from "./track.js";
import { SelectButton } from "./global.js";
import { Link, Redirect } from "wouter";
import css from "./common.css";


class AddTracks extends React.Component {
    constructor(props) {
        super(props);
        this.state = { tracks: null, word:null, inputTxt:'' }
    }
    load() {
        var url='tracks'
        if(this.state.word){
           url='tracks/search/'+this.state.word
        }
        api.get(url, null, (status, data) => {
            if (status == 200) {
                this.setState({ ...this.state, tracks: data.tracks })
            }
            else {
                console.error(status, data)
            }
        }) 
    }
    componentDidMount() {
        this.load()
    }
    tracks() {
        if (this.state.tracks) {
            return (<div><TrackListDefault tracks={this.state.tracks} uid='search' /></div>)
        }
        else {
            return (<div className="center ink-white size-m" style={{ padding: '2rem 1rem' }}>Loading..</div>)
        }
    } 
    searchBar(){
        var cls=css.searchBar+' center'
        return(<div className={cls}>
            <input autoFocus id={css.search} onChange={(e)=>{
                var txt=(e.target.value)
                if(this.state.word&&!txt.trim().length){
                    this.setState({...this.state,inputTxt:'',word:null,tracks:null},()=>{
                        this.load()
                    })
                }
                else
                this.setState({...this.state,inputTxt:txt})
            }} className="input" value={this.state.inputTxt} placeholder="Search" type="text"></input>
            <div onClick={()=>{
                if(this.state.inputTxt&&this.state.inputTxt.length){
                    var word=(this.state.inputTxt.trim().replace(/ /g,'+'))
                    this.setState({...this.state,word,tracks:null},()=>{
                        this.load()
                    })
                }
                else{
                    this.load()
                }
            }} className={css.searchButt+' center size-s'}>🔍</div>
        </div>)
    }
    render() {
        return (<div className="container" style={{ padding: '1rem 0.5rem' }}>
                <div className="center ink-white base-regular size-xl">
                    Search music
            </div>
                <br />
                {this.searchBar()}
                {this.tracks()}
            </div>)
    }
}

export default AddTracks;