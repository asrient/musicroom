import $ from "jquery";
import React, { Component } from "react";
import Header from "./header.js";
import { UserItem } from "./user.js";
import { Link, Route, Redirect } from "wouter";

class Friends extends React.Component {
    constructor(props) {
        super(props);
        this.state = { friends: null, error: null, wait: false }
    }
    load() {
        api.get('friends', null, (status, data) => {
            if (status == 200) {
                //data.friendship_status = 1
                this.setState({ ...this.state, friends: data.friends, error: null })
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
            list.push(<UserItem key={friend.user_id} {...friend}/>)
        });
        if (list.length) {
            return (list)
        }
        else {
            return (<div className="center ink-grey size-m base-regular" style={{ padding: '2rem 1rem' }}>
                You have no friends! Aww..
            </div>)
        }
    }
    content() {
        if (this.state.friends)
            return (<div>
                {this.friends()}
            </div>)
        else
            return (<div className="center ink-white size-m base-regular" style={{ padding: '2rem 1rem' }}>Loading..</div>)
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
                    My friends
                </div>
                <br />
                {this.content()}
                <br />
            </div>)
        }
    }
    render() {
            return (<>
                <Header blank />
                {this.main()}
            </>)
    }
}

export default Friends;