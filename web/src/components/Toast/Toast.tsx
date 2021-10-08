import React, {useEffect} from 'react'
import {useToast} from "./ToastProvider";
import './Toast.css'

interface Props {
  children: string
  id: number
}

export default ({ children, id }: Props) => {
  const { removeToast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => {
      removeToast(id);
    }, 3000); // delay

    return () => {
      clearTimeout(timer);
    };
  }, [id, removeToast]);

  const onCLick = () => {
    removeToast(id)
  }

  return <div className='toast' onClick={onCLick}>{children}</div>
}
