import client from '@/services/api';
import type { Project } from "@/types";
import { redirect, useLoaderData, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router-dom';
import { ProjectForm } from './ProjectAdd';

export async function projectEditLoader({ params }: LoaderFunctionArgs) {
  const { data } = await client.get(`/projects/${params.id}`);
  return data;
}

export async function projectEditAction({ request, params }: ActionFunctionArgs) {
  const data = await request.json();
  // TODO: Implement custom project details support
  data.details = [];
  await client.put(`/projects/${params.id}`, data);
  return redirect(`/projects/${params.id}`);
}

export default function ProjectEdit() {
  const initProject = useLoaderData() as Project;

  return <ProjectForm title={`Edit Project #${initProject.id}`} initProject={initProject as Project} />
}