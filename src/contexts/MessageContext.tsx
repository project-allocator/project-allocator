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
      messageError: (message) => {
        instance.error({
          message: "Error",
          description: message,
          placement: "bottomRight",
        });
      }
    }}>
      {contextHolder}
      {children}
    </MessageContext.Provider>
  )
}

export function useNotificationContext() {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error("useNotificationContext() was used outside of its Provider.");
  }
  return context
}