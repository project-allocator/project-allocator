import client from "./client";

interface ShortlistBase {
  preference: number,
  user_id: number,
  project_id: number,
}

type ShortlistRead = ShortlistBase

export function reorderShortlists() {
  client.post('/users/');
}