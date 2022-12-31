import React from "react";
import './PillForm.css'

interface Props {
  children: JSX.Element[]
}

export default (props: Props) => {
  return (
    <div className='pill-form'>
      {props.children}
    </div>
  )
}
