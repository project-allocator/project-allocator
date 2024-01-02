import ProjectForm from "@/components/projects/ProjectForm";
import { useMessage } from "@/contexts/MessageContext";
import { useCreateProject } from "@/hooks/projects";
import { Divider, Typography } from "antd";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

export default function AddProject() {
  const navigate = useNavigate();
  const { messageError, messageSuccess } = useMessage();

  const createProject = useCreateProject();

  function handleCreateProject(values: any) {
    createProject.mutate(values, {
      onSuccess: () => {
        messageSuccess("Successfully created project");
        navigate("/projects");
      },
      onError: () => messageError("Failed to create project"),
    });
  }

  return (
    <>
      <Title level={3}>Add Project</Title>
      <Divider />
      <ProjectForm onFinish={handleCreateProject} />
    </>
  );
}
