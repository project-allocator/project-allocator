import ProjectForm from "@/components/projects/ProjectForm";
import { useProject } from "@/hooks/projects";
import { Divider, Typography } from "antd";
import { useParams } from "react-router-dom";

const { Title } = Typography;

export default function EditProject() {
  const { id: projectId } = useParams();
  const initialProject = useProject(projectId!);

  return (
    <>
      <Title level={3}>Edit Project</Title>
      <Divider />
      <ProjectForm initProject={initialProject.data!} />
    </>
  );
}
