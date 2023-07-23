export interface User {
  id: number;
  name: string;
  email: string;
  role: "staff" | "student";
}

export interface Project {
  id: number;
  title: string;
  description: string;
  categories: string[];
}

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