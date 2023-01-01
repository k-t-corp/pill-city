import React from "react";
import {createPortal} from "react-dom";
import ToastComponent from './Toast'
import './ToastContainer.css'

export interface Toast {
  id: number
  content: string
  dismissible: boolean
}

interface Props {
  toasts: Toast[]
}

const ToastContainer = ({ toasts }: Props) => {
  return createPortal(
    <div className='toast-container'>
      {toasts.map(item => {
        return <ToastComponent key={item.id} id={item.id} dismissible={item.dismissible}>{item.content}</ToastComponent>
      })}
    </div>,
    document.body
  );
}

export default ToastContainer
