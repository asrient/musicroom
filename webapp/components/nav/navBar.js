import React, { Component } from "react";
import { Link, useRoute } from "wouter";
import css from "./navBar.css";


function NavLink({ href, children}) {
    const [isActive] = useRoute(href);

    return (
        <Link href={href} className={"hstack size-s base-regular size-m "+css.bar + (isActive ? ' '+css.activeLink : "")}>
            {children}
        </Link>
    )
}

export default function NavBar() {
    return (
        <div className={"hstack size-s base-regular size-m "+css.bar}>
            <NavLink href="/browse">Explore</NavLink>
            <NavLink href="/search">Search</NavLink>
        </div>
    )
}

