import $ from "jquery";
import React, { Component } from "react";
import { Link, Route } from "wouter";
import { ExploreSections, Rooms } from "../../browse";


export default function ForYouPage() {
  return (
    <>
      <Rooms />
      <ExploreSections apiUrl="recommendations" />
    </>
  );
}
