export interface User {
  name: string,
  email: string,
  role: "staff" | "student",
}


export interface Project {
  id: number;
  title: string;
  description: string;
  categories: string[];
}
