import { ProjectService } from '@/api';
import { ProjectForm } from '@/components/ProjectForm';
import { Divider, Typography } from 'antd';
import { redirect, type ActionFunctionArgs } from 'react-router-dom';

const { Title } = Typography;

export async function projectAddAction({ request }: ActionFunctionArgs) {
  const data = await request.json();
  await ProjectService.createProject(data);
  return redirect('/projects');
}

export default function ProjectAdd() {
  return (
    <>
      <Title level={3}>
        Add a New Project
      </Title>
      <Divider />
      <ProjectForm />
    </>
  );
}
