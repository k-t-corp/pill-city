import React from "react";
import './PillForm.css'

interface Props {
  children: JSX.Element[]
}

const PillForm = (props: Props) => {
  return (
    <div className='pill-form'>
      {props.children}
    </div>
  )
}

export default PillForm
