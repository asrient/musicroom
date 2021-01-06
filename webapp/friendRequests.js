import $ from "jquery";
import React, { Component } from "react";
import Header from "./header.js";
import { UserItem } from "./user.js";
import { SelectButton } from "./global.js";
import { Link, Route, Redirect } from "wouter";
import css from "./common.css";

class FriendRequests extends React.Component {
    constructor(props) {
        super(props);
        this.state = { requests: null, selected: [], error: null, wait: false, done: false }
    }
    load() {
        api.get('friends/requests', null, (status, data) => {
            if (status == 200) {
                //data.friendship_status = 1
                this.setState({ ...this.state, requests: data.requests, error: null })
            }
            else {
                console.error(status, data)
                if (status == 400) {
                    this.setState({ ...this.state, error: data.msg })
                }
            }
        })
    }
    componentDidMount() {
        this.load()
    }
    requests() {
        var list = []
        this.state.requests.forEach(friend => {
            var isSel = this.state.selected.includes(friend.user_id)
            list.push(<UserItem key={friend.user_id} {...friend}>
                <SelectButton selected={isSel} onClick={() => {
                        var isSel = this.state.selected.includes(friend.user_id)
                        var selected = this.state.selected
                        if (!isSel) {
                            selected.push(friend.user_id)
                        }
                        else {
                            var ind = selected.findIndex((id) => { return id == friend.user_id })
                            selected.splice(ind, 1);
                        }
                        this.setState({ ...this.state, selected })
                    }} />
            </UserItem>)
        });
        if (list.length) {
            return (list)
        }
        else {
            return (<div className="center ink-grey size-m base-regular" style={{ padding: '2rem 1rem' }}>
                No pending requests
            </div>)
        }
    }
    content() {
        if (this.state.requests)
            return (<div>
                {this.requests()}
            </div>)
        else
            return (<div className="center ink-white size-m base-regular" style={{ padding: '2rem 1rem' }}>Loading..</div>)
    }
    done(){
        var ids=this.state.selected;
        var counter=0;
        ids.forEach((id)=>{
            api.post('friends/add', {user_id: id}, (status, data) => {
                if (status == 201) {
                    //
                }
                else {
                    console.error(status, data)
                }
                counter++;
                if(counter>=ids.length){
                    window.state.toast('Saved','/friends')
                    this.setState({ ...this.state, wait: false, done: true })
                }
            })
        })
    }
    opt() {
        var txt = 'Accept'
        if (this.state.wait) {
            txt = 'Saving..'
        }
        if (this.state.selected.length)
            return (<>
                <div style={{ height: '6rem' }}></div>
                <div id={css.buttContainer} className="center">
                    <div className='redButt center' onClick={() => {
                        if (!this.state.wait) {
                            this.setState({ ...this.state, wait: true })
                            this.done()
                        }
                    }}>{txt}</div>
                </div>
            </>)
        else
            return (<div></div>)
    }
    main() {
        if (this.state.error) {
            return (<div className="center container ink-light base-regular size-l" style={{ padding: '3rem 1rem' }}>
                {this.state.error}
            </div>)
        }
        else {
            return (<div className="container" style={{ padding: '1rem 0.5rem' }}>
                <div className="ink-white base-regular size-xxl">
                    Friend requests
                </div>
                <br />
                {this.content()}
                <br />
                {this.opt()}
            </div>)
        }
    }
    render() {
        if (this.state.done)
            return (<Redirect to='/account' />)
        else
            return (<>
                <Header blank />
                {this.main()}
            </>)
    }
}

export default FriendRequests;