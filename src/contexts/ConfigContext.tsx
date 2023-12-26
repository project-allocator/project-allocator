import { ConfigService } from "@/api";
import React, { useContext, useEffect, useState } from "react";

interface Config {
  key: string;
  value: any;
}

const ConfigContext = React.createContext<Config[] | undefined>(undefined);

interface ConfigContextProviderProps {
  children: React.ReactNode;
}

export function ConfigContextProvider({ children }: ConfigContextProviderProps) {
  const [configs, setConfigs] = useState<Config[]>();

  useEffect(() => {
    ConfigService.readConfigs()
      .then((configs) => setConfigs(configs))
      .catch((error) => console.error(error));
  }, []);

  return <ConfigContext.Provider value={configs}>{children}</ConfigContext.Provider>;
}

export function useConfig(key: string) {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error("useConfig() was used outside of its Provider.");
  }

  const config = context.find((config) => config.key === key);
  return config?.value;
}
