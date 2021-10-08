import React, { useState, useContext, useCallback } from "react";
import ToastContainer from "./ToastContainer";
import {Toast} from './ToastContainer'

interface Context {
  addToast: (content: string) => void
  removeToast: (id: number) => void
}

const ToastContext = React.createContext<Context | null>(null);

let id = 1;

interface Props {
  children: JSX.Element
}

const ToastProvider = ({ children }: Props) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    content => {
      setToasts(toasts => [
        ...toasts,
        {
          id: id++,
          content
        }
      ]);
    },
    [setToasts]
  );

  const removeToast = useCallback(
    id => {
      setToasts(toasts => toasts.filter(t => t.id !== id));
    },
    [setToasts]
  );

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
