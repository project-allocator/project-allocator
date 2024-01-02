import { Spin } from "antd";
import React, { useContext, useState } from "react";

const SpinContext = React.createContext<{
  isSpinning: boolean;
  setIsSpinning: (isSpinning: boolean) => void;
}>({
  isSpinning: false,
  setIsSpinning: () => {},
});

export function SpinContextProvider({ children }: { children: React.ReactNode }) {
  const [isSpinning, setIsSpinning] = useState(false);

  return (
    <SpinContext.Provider value={{ isSpinning, setIsSpinning }}>
      <Spin spinning={isSpinning} fullscreen />
      {children}
    </SpinContext.Provider>
  );
}

export function useSpin() {
  const context = useContext(SpinContext);
  if (!context) {
    throw new Error("useSpin() was used outside of its Provider.");
  }
  return context;
}
