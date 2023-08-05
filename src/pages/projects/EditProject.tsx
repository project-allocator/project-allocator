import { ProjectRead, ProjectService } from '@/api';
import { ProjectForm } from '@/components/ProjectForm';
import { Divider, Typography } from 'antd';
import { redirect, useLoaderData, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router-dom';

const { Title } = Typography;

export async function editProjectLoader({ params }: LoaderFunctionArgs) {
  return await ProjectService.readProject(parseInt(params.id!));
}

export async function editProjectAction({ request, params }: ActionFunctionArgs) {
  const data = await request.json();
  await ProjectService.updateProject(parseInt(params.id!), data);
  return redirect(`/projects/${params.id}`);
}

export default function EditProject() {
  const initialProject = useLoaderData() as ProjectRead;

  return (
    <>
      <Title level={3}>
        Edit Project #{initialProject.id}
      </Title>
      <Divider />
      <ProjectForm initProject={initialProject as ProjectRead} />
    </>
  );
}