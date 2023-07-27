import { notification } from "antd";
import { NotificationInstance } from "antd/es/notification/interface";
import React, { useContext } from "react";

interface NotificationContextType {
  instance: NotificationInstance,
  notifySuccess: (message: string) => void,
  notifyError: (message: string) => void,
}

const NotificationContext = React.createContext<NotificationContextType | undefined>(undefined);

export function NotificationContextProvider({ children }: { children: React.ReactNode }) {
  const [instance, contextHolder] = notification.useNotification();

  return (
    <NotificationContext.Provider value={{
      instance,
      notifySuccess: (message) => {
        instance.info({
          message: "Success",
          description: message,
          placement: "bottomRight",
        });
      },
      notifyError: (message) => {
        instance.error({
          message: "Error",
          description: message,
          placement: "bottomRight",
        });
      }
    }}>
      {contextHolder}
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotificationContext() was used outside of its Provider.");
  }
  return context
}