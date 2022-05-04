import React from "react";
import './MediaNavButtons.css'
import {ChevronDoubleLeftIcon, ChevronDoubleRightIcon} from "@heroicons/react/solid";

interface Props {
  hasPrevious: boolean
  onPrevious: () => Promise<void>
  hasNext: boolean
  onNext: () => Promise<void>
}

export default (props: Props) => {
  const { onPrevious, onNext, hasPrevious, hasNext } = props

  if (!hasPrevious && !hasNext) {
    return null
  }

  return (
    <div className='media-nav-buttons'>
      <div
        className='media-nav-button'
        style={{visibility: !hasPrevious ? 'hidden' : 'visible'}}
        onClick={async e => {
          e.preventDefault()
          await onPrevious()
        }}
      >
        <ChevronDoubleLeftIcon className='media-nav-button-icon'/>
      </div>
      <div
        className='media-nav-button'
        style={{visibility: !hasNext ? 'hidden' : 'visible'}}
        onClick={async e => {
          e.preventDefault()
          await onNext()
        }}
      >
        <ChevronDoubleRightIcon className='media-nav-button-icon'/>
      </div>
    </div>
  )
}
