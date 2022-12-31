import React, {useState} from "react"
import SwipeableViews from 'react-swipeable-views';
import {ChevronLeftIcon, ChevronRightIcon} from "@heroicons/react/solid";
import './PillSlide.css'

export interface Slide {
  title: string,
  icon: JSX.Element,
  el: JSX.Element
}

interface Props {
  slides: Slide[]
}

export default (props: Props) => {
  const {slides} = props

  if (slides.length === 0) {
    return null
  }

  if (slides.length === 1) {
    return slides[0].el
  }

  const [showingIndex, updateShowingIndex] = useState(0)
  const titles = slides.map(_ => _.title)
  const icons = slides.map(_ => _.icon)

  return (
    <>
      <SwipeableViews
        index={showingIndex}
        onChangeIndex={i => {
          updateShowingIndex(i)
        }}
        resistance={true}
      >
        {slides.map(_ => _.el)}
      </SwipeableViews>
      <div className='pill-slide-nav-wrapper'>
        <div
          className={`pill-slide-nav${showingIndex === 0 ? ' pill-slide-nav-hidden' : ''}`}
          onClick={() => updateShowingIndex(showingIndex - 1)}
        >
          <ChevronLeftIcon />
          {showingIndex !== 0 && icons[showingIndex - 1]}
        </div>
        <div className='pill-slide-title'>
          <div className='pill-slide-title-icon'>{icons[showingIndex]}</div>
          <div>{titles[showingIndex]}</div>
        </div>
        <div
          className={`pill-slide-nav${showingIndex === slides.length - 1 ? ' pill-slide-nav-hidden' : ''}`}
          onClick={() => updateShowingIndex(showingIndex + 1)}
        >
          {showingIndex !== slides.length - 1 && icons[showingIndex + 1]}
          <ChevronRightIcon />
        </div>
      </div>
    </>
  )
}
