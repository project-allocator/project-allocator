import { ProjectsTable } from "@/components/projects/ProjectTable";
import { useProjects } from "@/hooks/projects";
import Loading from "@/pages/Loading";
import { Divider, Typography } from "antd";

const { Title } = Typography;

export default function Projects() {
  const projects = useProjects();

  if (projects.isLoading) return <Loading />;
  if (projects.isError) return null;

  return (
    <>
      <Title level={3}>All Projects</Title>
      <Divider />
      <ProjectsTable projects={projects.data!} />
    </>
  );
}
