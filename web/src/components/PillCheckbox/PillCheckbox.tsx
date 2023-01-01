import React from "react";
import Toggle from 'react-toggle'
import 'react-toggle/style.css'
import './PillCheckbox.css'

interface Props {
  checked: boolean
  onChange: (c: boolean) => void
  label: string
  disabled?: boolean
}

const PillCheckbox = (props: Props) => {
  return (
    <div className='pill-checkbox-container'>
      <Toggle
        checked={props.checked}
        onChange={e => {
          e.preventDefault()
          if (props.disabled) {
            return
          }
          props.onChange(!props.checked)
        }}
        disabled={props.disabled}
        icons={false}
        className='pill-checkbox'
      />
      <span className='pill-checkbox-label'>{props.label}</span>
    </div>
  )
}

export default PillCheckbox
