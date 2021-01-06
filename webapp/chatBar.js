import $ from "jquery";
import React, { Component } from "react";
import css from "./chatBar.css";
import TextareaAutosize from 'react-textarea-autosize';


function time() {
    return new Date().getTime()
}

const TYPING_PERIOD = 2200

class ChatBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = { text: '', isFocused: false, isTyping: false, lastTypingTime: 0 }
    }
    change = (event) => {
        var text = event.target.value;
        var isTyping = true
        var typingTime = this.state.lastTypingTime
        var currtime = time()
        if (!this.state.isFocused) {
            isTyping = false
        }
        else {
            if (currtime >= typingTime + TYPING_PERIOD)
                typingTime = time()
        }
        if (((typingTime >= this.state.lastTypingTime + TYPING_PERIOD) && isTyping) || (isTyping && !this.state.isTyping)) {
            window.state.setIsTyping(true)
        }
        this.setState({ ...this.state, text, isTyping, lastTypingTime: typingTime });
    }
    send = () => {
        var txt = this.state.text.trim();
        if (txt != '') {
            window.state.sendMessage(txt);
            this.setState({ ...this.state, text: '' });
        }
    }
    focused = () => {
        if (!this.props.scrollBottom)
            window.scrollTo(0, 0);
        else
            window.scrollTo(0, document.body.scrollHeight);
        this.setState({ ...this.state, isFocused: true })
    }
    blured = () => {
        if (this.state.isTyping) {
            window.state.setIsTyping(false)
        }
        this.setState({ ...this.state, isFocused: false, isTyping: false })
    }
    render() {
        var cls = css.chat_sendButt
        if (!this.state.text.trim().length) {
            cls += " " + css.disabled
        }
        return (<div className={css.chat_bar + ' center'}>
            <TextareaAutosize
                maxRows={5}
                placeholder="Chat"
                type="text"
                className={css.chat_input}
                value={this.state.text}
                onChange={this.change}
                onFocus={this.focused}
                onBlur={this.blured}
            />
            &nbsp;
            <div className={cls} onClick={this.send}></div>
        </div>)
    }
}

export default ChatBar