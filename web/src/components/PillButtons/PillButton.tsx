import React from "react";
import './PillButton.css'

export enum PillButtonVariant {
  Neutral = 0,
  Positive,
}

const variantToBackgroundColor = (variant: PillButtonVariant) => {
  if (variant === PillButtonVariant.Positive) {
    return '#E05140'
  } else {
    return '#727272'
  }
}

interface Props {
  text: string
  variant: PillButtonVariant
  onClick: () => void
  disabled?: boolean
}

const PillButton = (props: Props) => {
  return (
    <div
      className='pill-button'
      style={{
        cursor: props.disabled ? 'not-allowed' : 'pointer',
        backgroundColor: props.disabled ? '#727272' : variantToBackgroundColor(props.variant)
      }}
      onClick={e => {
        e.preventDefault()
        if (props.disabled) {
          return
        }
        props.onClick()
      }}
    >{props.text}</div>
  )
}

export default PillButton
