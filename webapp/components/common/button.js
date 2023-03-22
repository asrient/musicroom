import React, { Component, useEffect, useState } from "react";
import css from "../player/playerBar.css";
import { currentScreenType, generateRoomEmoji } from "../../utils";


export function IconButton({ url, size, title, onClick, noChroming, isDisabled, innerRef, color }) {
  const style = {};
  if (isDisabled) {
    style.opacity = 0.5;
    style.cursor = 'not-allowed';
  }
  if (!!color && currentScreenType() === 'desktop') {
    style.backgroundColor = color;
  }
  if (noChroming) {
    style.background = 'none';
  }
  return (
    <div ref={innerRef} className={css.ib} onClick={isDisabled ? null : onClick} style={style} title={title}>
      <img className={css.ib_icon + ' size-' + size} src={url} />
    </div>
  );
};

export function TextButton({ size, text, onClick }) {
  return (
    <div className={css.ib + ' size-' + size} onClick={onClick}>
      {text}
    </div>
  );
};
