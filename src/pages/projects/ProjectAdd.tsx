import { ProjectForm } from '@/components/ProjectForm';
import { ProjectService } from '@/services/api';
import type { ActionFunctionArgs } from 'react-router-dom';

export async function projectAddAction({ request }: ActionFunctionArgs) {
  const data = await request.json();
  await ProjectService.createProject(data);
  return null;
}

export default function ProjectAdd() {
  return <ProjectForm title="Add a New Project" />
}
