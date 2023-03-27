import React, { useState } from "react";
import { IconButton } from "../common/button";


export default function LikeButton({ isLiked, isLoading, isDisabled, onClick, trackId }) {
    const [apiLoading, setApiLoading] = useState(false);
  
    const toggle = async () => {
      setApiLoading(true);
      if (!isLiked) {
      await window.state.likeTrack(trackId);
      }
      else {
      await window.state.unlikeTrack(trackId);
      }
      setApiLoading(false);
    }
  
    const onClickHandler = () => {
      if (isDisabled || apiLoading) return;
      !!onClick ? onClick(trackId, toggle): toggle();
    };
  
    return (isLoading ? '' : <IconButton isDisabled={isDisabled || apiLoading} size="xs" isLoading={apiLoading || isLoading} 
      onClick={onClickHandler} noChroming
      url={'/static/icons/' + (isLiked ? 'liked.svg': 'like.svg')} title={isLiked ? 'Remove from library': 'Add to library'} />)
  }
