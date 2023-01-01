import React from 'react'
import './PillButtons.css'

interface Props {
  children: any
}

const PillButtons = (props: Props) => {
  return (
    <div className='pill-buttons'>
      {props.children}
    </div>
  )
}

export default PillButtons
