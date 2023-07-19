import client from "./client";

interface UserBase {
  name: string,
  email: string,
  role: "staff" | "student",
}

export type UserRead = UserBase & {
  id: number
}

export function readUser(id: number) {
  return client.get(`/users/${id}`);
}
