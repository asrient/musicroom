import $ from "jquery";
import React, { Component } from "react";
import Header from "./header.js";
import { UserItem } from "./user.js";
import { Link, Route, Redirect } from "wouter";
import css from "./common.css";

class RoomPreview extends React.Component {
    constructor(props) {
        super(props);
        this.state = { friends: null, others: null, error: null, wait: false, done: false }
    }
    load() {
        api.post('room/members', { room_id: this.props.room_id }, (status, data) => {
            if (status == 200) {
                //data.friendship_status = 1
                this.setState({ ...this.state, friends: data.friends, others: data.others, error: null })
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
    friends() {
        var list = []
        this.state.friends.forEach(friend => {
            list.push(<UserItem key={friend.user_id} {...friend} />)
        });
        if (list.length) {
            return (<div>
                <div style={{ padding: '0.7rem 0.5rem' }} className="ink-light base-semilight size-s">FRIENDS</div>
                {list}
            </div>)
        }
        else {
            return (<div></div>)
        }
    }
    others() {
        var list = []
        this.state.others.forEach(friend => {
            list.push(<UserItem key={friend.user_id} {...friend} />)
        });
        if (list.length) {
            return (<div>
                <div style={{ padding: '0.7rem 0.5rem' }} className="ink-light base-semilight size-s">OTHERS</div>
                {list}
            </div>)
        }
        else {
            return (<div></div>)
        }
    }
    members() {
        if (this.state.friends && this.state.others)
            return (<div>
                {this.friends()}
                {this.others()}
            </div>)
        else
            return (<div className="center ink-white size-m base-regular" style={{ padding: '2rem 1rem' }}>Loading..</div>)
    }
    opt() {
        var txt = 'Join'
        if (this.state.wait) {
            txt = 'Joining..'
        }
        var st = window.state.getState()
        if (!st.room || (st.room && st.room.room_id != this.props.room_id))
            return (<>
                <div style={{ height: '6rem' }}></div>
                <div id={css.buttContainer} className="center">
                    <div className='redButt center' onClick={() => {
                        if (!this.state.wait) {
                            this.setState({ ...this.state, wait: true })
                            window.state.joinRoom(this.props.room_id, (res) => {
                                if(res)
                                this.setState({ ...this.state, wait: false, done: true })
                                else
                                this.setState({ ...this.state, wait: false, error: "You don't have access to this room" })
                            });
                        }
                    }}>{txt}</div>
                </div>
            </>)
        else
            return (<div></div>)
    }
    main() {
        if (this.state.error) {
            return (<div className="center-col container ink-light base-regular size-l" style={{ padding: '3rem 1rem' }}>
                <br/>
                <br/>
                {this.state.error}
                <br/>
                <br/>
                    <Link to="/rooms" className="center redButt">Close</Link>
                <br/>
            </div>)
        }
        else {
            return (<div className="container" style={{ padding: '1rem 0.5rem' }}>
                <div className="ink-white base-regular size-xxl">
                    Who's here?
                </div>
                <br />
                {this.members()}
                <br />
                {this.opt()}
            </div>)
        }
    }
    render() {
        if (this.state.done)
            return (<Redirect to='/room' />)
        else
            return (<>
                <Header blank />
                {this.main()}
            </>)
    }
}

export default RoomPreview;