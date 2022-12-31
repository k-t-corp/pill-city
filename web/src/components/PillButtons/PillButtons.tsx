import React from 'react'
import './PillButtons.css'

interface Props {
  children: any
}

export default (props: Props) => {
  return (
    <div className='pill-buttons'>
      {props.children}
    </div>
  )
}
