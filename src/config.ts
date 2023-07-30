import config from '../config.yaml';

export interface Config {
  projects: {
    details: {
      name: string;
      title: string;
      description: string;
      message: string;
      type: "textfield" | "textarea" | "number" | "slider" | "date" | "time" | "switch" | "select" | "checkbox" | "radio";
      required: boolean;
      options?: string[];
    }[];
  };
}

export default config as Config;
