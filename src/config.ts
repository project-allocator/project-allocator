import config from '../config.yaml';

export interface Config {
  project: {
    details: {
      name: string;
      title: string;
      description: string;
      message: string;
      type: "textfield" | "textarea" | "number" | "slider" | "date" | "time" | "switch" | "select" | "checkbox" | "radio";
      required: boolean;
    }[];
  };
}

export default config as Config;
