import ProjectForm from "@/components/projects/ProjectForm";
import { useMessage } from "@/contexts/MessageContext";
import { useProject, useUpdateProject } from "@/hooks/projects";
import { Divider, Typography } from "antd";
import { useNavigate, useParams } from "react-router-dom";

const { Title } = Typography;

export default function EditProject() {
  const navigate = useNavigate();
  const { messageError, messageSuccess } = useMessage();

  const { id: projectId } = useParams();
  const initialProject = useProject(projectId!);
  const updateProject = useUpdateProject(projectId!);

  function handleUpdateProject(values: any) {
    updateProject.mutate(values, {
      onSuccess: () => {
        messageSuccess("Successfully updated project");
        navigate(`/projects/${projectId}`);
      },
      onError: () => messageError("Failed to update project"),
    });
  }

  return (
    <>
      <Title level={3}>Edit Project</Title>
      <Divider />
      <ProjectForm initProject={initialProject.data!} onFinish={handleUpdateProject} />
    </>
  );
}
