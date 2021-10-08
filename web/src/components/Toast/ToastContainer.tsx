import React from "react";
import {createPortal} from "react-dom";
import Toast from './Toast'
import './ToastContainer.css'

export interface Toast {
  id: number
  content: string
}

interface Props {
  toasts: Toast[]
}

export default ({ toasts }: Props) => {
  return createPortal(
    <div className='toast-container'>
      {toasts.map(item => {
        return <Toast key={item.id} id={item.id}>{item.content}</Toast>
      })}
    </div>,
    document.body
  );
}
