import client from "./client";

interface ProjectBase {
  title: string,
  description: string,
  categories: string[],
}

export type ProjectRead = ProjectBase & {
  id: number
}

export type ProjectCreate = ProjectBase

export interface ProjectUpdate {
  title?: string,
  description?: string,
  categories?: string[],
}

export function readProjects() {
  return client.get('/projects');
}

export function readProject(id: number) {
  return client.get(`/projects/${id}`);
}

export function createProject(project: ProjectCreate) {
  return client.post('/projects', project);
}

export function updateProject(id: number, project: ProjectUpdate) {
  return client.put(`/projects/${id}`, project);
}

export function deleteProject(id: number) {
  return client.delete(`/projects/${id}`);
}