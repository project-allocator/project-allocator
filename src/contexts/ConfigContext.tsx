import { DefaultService } from "@/api";
import React, { useContext, useEffect, useState } from "react";

interface Config {
  projects: {
    details: {
      name: string;
      title: string;
      description: string;
      message: string;
      type:
        | "textfield"
        | "textarea"
        | "number"
        | "slider"
        | "date"
        | "time"
        | "switch"
        | "select"
        | "checkbox"
        | "radio";
      required: boolean;
      options?: string[];
    }[];
  };
}

const ConfigContext = React.createContext<Config | undefined>(undefined);

interface ConfigContextProviderProps {
  children: React.ReactNode;
}

export function ConfigContextProvider({
  children,
}: ConfigContextProviderProps) {
  const [config, setConfig] = useState<Config>();

  useEffect(() => {
    DefaultService.readConfig()
      .then((config) => setConfig(config))
      .catch((error) => console.error(error));
  }, []);

  return (
    <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error("useConfig() was used outside of its Provider.");
  }
  return context;
}
