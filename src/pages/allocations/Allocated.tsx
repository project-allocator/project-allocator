import { AllocationService, ProjectRead } from '@/api';
import { ProjectContent } from '@/components/ProjectContent';
import ProjectHeader from '@/components/ProjectHeader';
import { Divider, Empty } from "antd";
import { useLoaderData } from 'react-router-dom';

export async function allocatedLoader() {
  return await AllocationService.readAllocated();
}

export default function Allocated() {
  const project = useLoaderData() as ProjectRead;

  return (
    <>
      <ProjectHeader
        title="Allocated Project"
        project={project}
      />
      <Divider />
      {project
        ? <ProjectContent project={project} />
        : <Empty />}
    </>
  );
}