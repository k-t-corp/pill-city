import React from "react";
import './PillCheckbox.css'
import {CheckCircleIcon} from "@heroicons/react/solid";
import {XCircleIcon} from "@heroicons/react/outline";

interface Props {
  checked: boolean
  onChange: (c: boolean) => void
  label: string
  disabled?: boolean
}

export default (props: Props) => {
  return (
    <div
      className='pill-checkbox'
      onClick={e => {
        e.preventDefault()
        if (props.disabled) {
          return
        }
        props.onChange(!props.checked)
      }}
      style={{
        cursor: props.disabled ? 'not-allowed' : 'pointer',
        color: props.checked ? '#555555' : '#b7b7b7'
      }}
    >
      <div className='pill-checkbox-icon'>
        {props.checked ?
          <CheckCircleIcon /> :
          <XCircleIcon />
        }
      </div>
      <div>{props.label}</div>
    </div>
  )
}
