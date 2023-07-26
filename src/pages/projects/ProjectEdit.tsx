import { ProjectRead, ProjectService } from '@/api';
import { ProjectForm } from '@/components/ProjectForm';
import { redirect, useLoaderData, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router-dom';

export async function projectEditLoader({ params }: LoaderFunctionArgs) {
  return await ProjectService.readProject(parseInt(params.id!));
}

export async function projectEditAction({ request, params }: ActionFunctionArgs) {
  const data = await request.json();
  await ProjectService.updateProject(parseInt(params.id!), data);
  return redirect(`/projects/${params.id}`);
}

export default function ProjectEdit() {
  const initProject = useLoaderData() as ProjectRead;

  return <ProjectForm title={`Edit Project #${initProject.id}`} initProject={initProject as ProjectRead} />
}