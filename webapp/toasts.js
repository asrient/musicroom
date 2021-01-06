import $ from "jquery";
import React, { Component } from "react";
import css from "./toasts.css";
import { Redirect, Link } from "wouter";


class Toasts extends React.Component {
    constructor(props) {
        super(props);
        this.state = { toasts: [] }
    }
    componentDidMount() {
        this.parseState();
        this.unsub = window.state.subscribe(() => {
            this.parseState();
        })
    }
    parseState() {
        var st = window.state.getState();
            this.setState({ ...this.state, toasts:st.toasts })
    }
    componentWillUnmount() {
        this.unsub();
    }
    toast (key,html,link=null) {
        var content=()=>{
            if(link){
                return(<Link href={link} className={css.content+' '+css.link}>
                    <div className={css.mr_title}>🎵 FRIENDZONE</div>
                <div>{html}</div>
                </Link>)
            }
            else{
                return(<div className={css.content}>
                    <div className={css.mr_title}>🎵 FRIENDZONE</div>
                    <div>{html}</div>
                    </div>)
            }
        }
        return (<div key={key} className={css.toast}>
            {content()}
            <div onClick={()=>{
                window.state.popToast(key);
            }} className={css.dismiss+' center'}>
                <img className='icon' style={{fontSize:'0.75rem',opacity:'0.5',margin:'0px'}} src='/static/icons/close.svg' />
            </div>
            </div>)
    }
    toasts(){
        var list=[]
        list=this.state.toasts.map((toast)=>{
            return this.toast(toast.key,toast.html,toast.link)
        })
        return list;
    }
    render() {
        return (<div id={css.stack}>
            {this.toasts()}
        </div>)
    }
}

export default Toasts