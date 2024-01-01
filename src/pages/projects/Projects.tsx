import { ProjectTable } from "@/components/projects/ProjectTable";
import { useApprovedProjects } from "@/hooks/projects";
import { Divider, Typography } from "antd";

const { Title } = Typography;

export default function Projects() {
  const projects = useApprovedProjects();

  return (
    <>
      <Title level={3}>All Projects</Title>
      <Divider />
      <ProjectTable projects={projects.data!} />
    </>
  );
}
