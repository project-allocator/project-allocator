import { ProjectRead, ProjectService } from '@/api';
import { ProjectForm } from '@/components/ProjectForm';
import { Divider, Typography } from 'antd';
import { redirect, useLoaderData, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router-dom';

const { Title } = Typography;

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

  return (
    <>
      <Title level={3}>
        Edit Project #{initProject.id}
      </Title>
      <Divider />
      <ProjectForm initProject={initProject as ProjectRead} />
    </>
  );
}