import { ProjectForm } from "@/components/projects/ProjectForm";
import { useProject } from "@/hooks/projects";
import Loading from "@/pages/Loading";
import { Divider, Typography } from "antd";
import { useParams } from "react-router-dom";

const { Title } = Typography;

export default function EditProject() {
  const { id: projectId } = useParams();
  const initialProject = useProject(projectId!);

  if (initialProject.isLoading) return <Loading />;
  if (initialProject.isError) return null;

  return (
    <>
      <Title level={3}>Edit Project</Title>
      <Divider />
      <ProjectForm initProject={initialProject.data!} />
    </>
  );
}
