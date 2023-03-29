import React, { Component } from "react";
import { Link, useRoute } from "wouter";
import css from "./navBar.css";


function NavLink({ href, children}) {
    const [isActive] = useRoute(href);

    return (
        <Link href={href} className={(isActive ? ' '+css.activeLink : "")}>
            {children}
        </Link>
    )
}

export default function NavBar() {
    return (
        <div className={"hstack base-regular "+css.bar}>
            <NavLink href="/browse">Explore</NavLink>
            <NavLink href="/feed">For You</NavLink>
            <NavLink href="/search">Search</NavLink>
            <NavLink href="/library">Library</NavLink>
        </div>
    )
}

