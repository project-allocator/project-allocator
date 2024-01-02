import { notification } from "antd";
import React, { useContext } from "react";

const MessageContext = React.createContext<{
  messageSuccess: (message: string) => void;
  messageError: (message: string) => void;
}>({
  messageSuccess: () => {},
  messageError: () => {},
});

export function MessageContextProvider({ children }: { children: React.ReactNode }) {
  const [instance, contextHolder] = notification.useNotification();

  return (
    <MessageContext.Provider
      value={{
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
        },
      }}
    >
      {contextHolder}
      {children}
    </MessageContext.Provider>
  );
}

export function useMessage() {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error("useMessage() was used outside of its Provider.");
  }
  return context;
}
