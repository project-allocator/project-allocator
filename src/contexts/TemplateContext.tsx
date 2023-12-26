import { ProjectService } from "@/api";
import React, { useContext, useEffect, useState } from "react";

interface Template {
  key: string;
  type: string;
  required: boolean;
  options: string[] | null;
  title: string;
  description: string;
  message: string;
}

const TemplateContext = React.createContext<Template[] | undefined>(undefined);

interface TemplateContextProviderProps {
  children: React.ReactNode;
}

export function TemplateContextProvider({ children }: TemplateContextProviderProps) {
  const [templates, setTemplates] = useState<Template[]>();

  useEffect(() => {
    ProjectService.readProjectDetailTemplates()
      .then((templates) => setTemplates(templates))
      .catch((error) => console.error(error));
  }, []);

  return <TemplateContext.Provider value={templates}>{children}</TemplateContext.Provider>;
}

export function useTemplates() {
  const context = useContext(TemplateContext);
  if (!context) {
    throw new Error("useTemplates() was used outside of its Provider.");
  }
  return context;
}
