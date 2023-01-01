import React, { useState, useContext, useCallback } from "react";
import ToastContainer from "./ToastContainer";
import {Toast} from './ToastContainer'

interface Context {
  addToast: (content: string, dismissible?: boolean) => number
  removeToast: (id: number) => void
}

const ToastContext = React.createContext<Context | null>(null);

let id = 1;

interface Props {
  children: JSX.Element
}

const ToastProvider = ({ children }: Props) => {
  const [toasts, updateToasts] = useState<Toast[]>([]);

  const addToast = useCallback((content: string, dismissible?: boolean) => {
    const newId = id++
    updateToasts(toasts => [
      ...toasts,
      {
        id: newId,
        content,
        dismissible: dismissible !== undefined ? dismissible : true
      }
    ])
    return newId
  }, [updateToasts]);

  const removeToast = useCallback((id: number) => {
    updateToasts(toasts => toasts.filter(t => t.id !== id));
  }, [updateToasts]);

  return (
    <ToastContext.Provider
      value={{
        addToast,
        removeToast
      }}
    >
      <ToastContainer toasts={toasts} />
      {children}
    </ToastContext.Provider>
  );
};

// todo: hacky
const useToast = (): Context => {
  return useContext(ToastContext) as Context;
};

export { ToastContext, useToast };
export default ToastProvider;
