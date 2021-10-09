import React, {useEffect} from 'react'
import {useToast} from "./ToastProvider";
import './Toast.css'

interface Props {
  children: string
  id: number
  dismissible: boolean
}

export default ({ children, id, dismissible }: Props) => {
  const { removeToast } = useToast();

  useEffect(() => {
    if (!dismissible) {
      return () => {}
    }

    const timer = setTimeout(() => {
      removeToast(id);
    }, 3000); // delay

    return () => {
      clearTimeout(timer);
    };
  }, [id, removeToast]);

  const onCLick = () => {
    if (dismissible) {
      removeToast(id)
    }
  }

  return <div className='toast' style={{cursor: dismissible ? 'pointer' : 'default'}} onClick={onCLick}>{children}</div>
}
