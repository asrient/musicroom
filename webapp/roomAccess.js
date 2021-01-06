import $ from "jquery";
import React, { Component } from "react";
import Header from "./header.js";
import { UserItem } from "./user.js";
import { SelectButton } from "./global.js";
import { Link, Redirect } from "wouter";
import css from "./common.css";

class RoomAccess extends React.Component {
    constructor(props) {
        super(props);
        this.state = { friends: null, accessUsers: null, add: [], remove: [], error: null, wait: false, done: false, code: 'loading..' }
    }
    load() {
        api.get('room/access/users', null, (status, data) => {
            if (status == 200) {
                this.setState({ ...this.state, accessUsers: data.access_users, error: null })
            }
            else {
                console.error(status, data)
                if (status == 400) {
                    this.setState({ ...this.state, error: data.msg })
                }
            }
        })
        api.get('friends', null, (status, data) => {
            if (status == 200) {
                this.setState({ ...this.state, friends: data.friends, error: null })
            }
            else {
                console.error(status, data)
                if (status == 400) {
                    this.setState({ ...this.state, error: data.msg })
                }
            }
        })
        api.get('room/access/code', null, (status, data) => {
            if (status == 200) {
                this.setState({ ...this.state, code: data.room_code, error: null })
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
    isSelected(userId) {
        var accessUser = this.state.accessUsers.find((user) => { return user.user_id == userId })
        if (accessUser == undefined) {
            return (this.state.add.includes(userId))
        }
        else {
            return (!this.state.remove.includes(userId))
        }
    }
    select(userId) {
        var accessUser = this.state.accessUsers.find((user) => { return user.user_id == userId })
        if (accessUser == undefined) {
            if (!this.state.add.includes(userId)) {
                this.state.add.push(userId)
                this.setState({ ...this.state })
            }
        }
        else {
            if (this.state.remove.includes(userId)) {
                var ind = this.state.remove.findIndex((id) => { return id == userId })
                this.state.remove.splice(ind, 1)
                this.setState({ ...this.state })
            }
        }
    }
    unselect(userId) {
        var accessUser = this.state.accessUsers.find((user) => { return user.user_id == userId })
        if (accessUser != undefined) {
            if (!this.state.remove.includes(userId)) {
                this.state.remove.push(userId)
                this.setState({ ...this.state })
            }
        }
        else {
            if (this.state.add.includes(userId)) {
                var ind = this.state.add.findIndex((id) => { return id == userId })
                this.state.add.splice(ind, 1)
                this.setState({ ...this.state })
            }
        }
    }
    getUserItem(user) {
        var isSel = this.isSelected(user.user_id)
        return (<UserItem key={user.user_id} {...user} >
            <SelectButton selected={isSel} onClick={() => {
                if (isSel) {
                    this.unselect(user.user_id)
                }
                else {
                    this.select(user.user_id)
                }
            }} />
        </UserItem>)
    }
    friends() {
        var list = []
        if (this.state.friends) {
            this.state.friends.forEach(friend => {
                list.push(this.getUserItem(friend))
            });
        }

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
        var friends = []
        if (this.state.friends) {
            friends = this.state.friends.map((friend) => { return friend.user_id })
        }
        var list = []
        this.state.accessUsers.forEach(user => {
            if (!friends.includes(user.user_id)) {
                list.push(this.getUserItem(user))
            }
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
    codeExport = () => {
        const url = window.location.protocol + '//' + window.location.host + '/code/' + this.state.code
        const shareData = {
            title: 'Friendzone Party?',
            text: "Lets have a party on Friendzone! Room code: " + this.state.code + " See you there!",
            url,
        }
        const clipText = url
        if (navigator.share) {
            // Web Share API is supported
            window.navigator.share(shareData).then(() => {
                state.toast("Room code shared!")
            })
                .catch((e) => {
                    console.error(e)
                });
        } else {
            var promise = navigator.clipboard.writeText(clipText).then(() => {
                state.toast("Link copied to clipboard")
            }, () => {
                state.toast("Failed to copy to clipboard")
            });
        }
    }
    code() {
        return (<div>
            <div style={{ padding: '0.7rem 0.5rem' }} className="ink-light base-semilight size-s">ROOM CODE</div>
            <div className="center-col" style={{ padding: '0.5rem', paddingBottom: '1.5rem' }}>
                <div className="ink-grey size-xs base-semilight">
                    Share this code to give them access to this room
                    </div>
                <div className={css.codeBox}>
                    <div style={{ padding: '0.6rem' }} className="center">{this.state.code}</div>
                    <div onClick={this.codeExport} className={css.codeExport + ' center'}>
                        <img className="icon" src="/static/icons/export.svg" style={{ fontSize: '0.9rem' }} />
                    </div>
                </div>
            </div>
        </div>)
    }
    users() {
        if (this.state.accessUsers)
            return (<div>
                {this.code()}
                {this.friends()}
                {this.others()}
            </div>)
        else
            return (<div className="center ink-white size-m base-regular" style={{ padding: '2rem 1rem' }}>Loading..</div>)
    }
    post(type = 'grant', ids, cb) {
        if (ids.length) {
            api.post('room/access/' + type, { user_ids: ids }, (status, data) => {
                if (status == 201) {
                    cb()
                }
                else {
                    console.error(status, data)
                    if (status == 400) {
                        this.setState({ ...this.state, wait: false, error: data.msg })
                    }
                }
            })
        }
        else {
            cb()
        }
    }
    done(add, remove) {
        var a1 = false, a2 = false
        this.post('grant', add, () => {
            a1 = true
            if (a1 && a2) {
                this.setState({ ...this.state, done: true })
            }
        })
        this.post('revoke', remove, () => {
            a2 = true
            if (a1 && a2) {
                this.setState({ ...this.state, done: true })
            }
        })
    }
    opt() {
        var txt = 'Save'
        if (this.state.wait) {
            txt = 'Saving..'
        }
        if (this.state.add.length || this.state.remove.length)
            return (<>
                <div style={{ height: '6rem' }}></div>
                <div id={css.buttContainer} className="center">
                    <div className='redButt center' onClick={() => {
                        if (!this.state.wait) {
                            this.setState({ ...this.state, wait: true })
                            this.done(this.state.add, this.state.remove)
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
                    Who can join you?
                </div>
                <br />
                {this.users()}
                <br />
                {this.opt()}
            </div>)
        }
    }
    render() {
        if (this.state.done)
            return (<Redirect to="/room" />)
        else
            return (<>
                <Header blank />
                {this.main()}
            </>)
    }
}

export default RoomAccess;