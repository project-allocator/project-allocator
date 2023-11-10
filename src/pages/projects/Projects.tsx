import { ProjectRead, ProjectService } from "@/api";
import { ProjectsTable } from "@/components/ProjectTable";
import { Divider, Typography } from "antd";
import { useLoaderData } from "react-router-dom";

const { Title } = Typography;

export async function projectsLoader() {
  return await ProjectService.readApprovedProjects();
}

export default function Projects() {
  const projects = useLoaderData() as ProjectRead[];

  return (
    <>
      <Title level={3} className="mb-0">
        List of All Projects
      </Title>
      <Divider />
      <ProjectsTable projects={projects} />
    </>
  );
}
