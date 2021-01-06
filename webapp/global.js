import $ from "jquery";
import React, { Component } from "react";
import css from "./styles.css";
import { useLocation } from "wouter";


function route(path) {
    const [location, setLocation] = useLocation();
    setLocation(path)
    return(<div>routing..</div>)
}

class SelectButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
    }
    componentDidMount() {
    }
    fill() {
        if (this.props.selected) {
            return (<div className={css.selFill}></div>)
        }
        else {
            return (<div></div>)
        }
    }
    click = () => {
        if (this.props.onClick) {
            this.props.onClick()
        }
    }
    render() {
        return (<div onClick={this.click} className={css.selButt + ' center'}>
            {this.fill()}
        </div>)
    }
}

export { SelectButton, route }