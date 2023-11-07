import { notification } from "antd";
import { NotificationInstance } from "antd/es/notification/interface";
import React, { useContext } from "react";

interface MessageContextType {
  instance: NotificationInstance,
  messageSuccess: (message: string) => void,
  messageError: (message: string) => void,
}

const MessageContext = React.createContext<MessageContextType | undefined>(undefined);

interface MessageContextProviderProps {
  children: React.ReactNode;
}

export function MessageContextProvider({ children }: MessageContextProviderProps) {
  const [instance, contextHolder] = notification.useNotification();

  return (
    <MessageContext.Provider value={{
      instance,
      messageSuccess: (message) => {
        instance.info({
          message: "Success",
          description: message,
          placement: "bottomRight",
        });
      },
      messageError: (error: any) => {
        instance.error({
          message: "Error",
          description: `${error.status} ${error.statusText}: ${error.body?.detail}`,
          placement: "bottomRight",
        });
      }
    }}>
      {contextHolder}
      {children}
    </MessageContext.Provider>
  )
}

export function useMessage() {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error("useMessage() was used outside of its Provider.");
  }
  return context
}