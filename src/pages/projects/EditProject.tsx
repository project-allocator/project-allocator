import ProjectForm from "@/components/projects/ProjectForm";
import { useProject } from "@/hooks/projects";
import Await from "@/pages/Await";
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
      <Await query={initialProject} errorElement="Failed to load project">
        {(initialProject) => <ProjectForm initProject={initialProject} />}
      </Await>
    </>
  );
}
