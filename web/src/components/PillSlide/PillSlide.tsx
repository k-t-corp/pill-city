import React, {useState} from "react"
import SwipeableViews from 'react-swipeable-views';
import {ChevronLeftIcon, ChevronRightIcon} from "@heroicons/react/solid";
import './PillSlide.css'

interface Props {
  children: JSX.Element | JSX.Element[]
}

export default (props: Props) => {
  const children = React.Children.toArray(props.children)
  
  if (children.length === 0) {
    return null
  }
  
  if (children.length === 1) {
    return children[0]
  }

  const [showingIndex, updateShowingIndex] = useState(0)

  return (
    <>
      <SwipeableViews
        index={showingIndex}
        onChangeIndex={i => {
          updateShowingIndex(i)
        }}
      >
        {props.children}
      </SwipeableViews>
      <div className='pill-slide-nav-wrapper'>
        <div
          className={`pill-slide-nav${showingIndex === 0 ? ' pill-slide-nav-hidden' : ''}`}
          onClick={() => updateShowingIndex(showingIndex - 1)}
        >
          <ChevronLeftIcon />
        </div>
        <span>{showingIndex + 1}/{children.length}</span>
        <div
          className={`pill-slide-nav${showingIndex === children.length - 1 ? ' pill-slide-nav-hidden' : ''}`}
          onClick={() => updateShowingIndex(showingIndex + 1)}
        >
          <ChevronRightIcon />
        </div>
      </div>
    </>
  )
}
