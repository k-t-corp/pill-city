import React from "react";
import './PillInput.css'

interface Props {
  placeholder: string
  value: string
  onChange: (newValue: string) => void
}

const PillInput = (props: Props) => {
  return (
    <input
      className="pill-input"
      type="text"
      placeholder={props.placeholder}
      value={props.value}
      onChange={e => {
        e.preventDefault()
        props.onChange(e.target.value)
      }}
    />
  )
}

export default PillInput
