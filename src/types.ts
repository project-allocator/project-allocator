export interface User {
  id: number,
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
