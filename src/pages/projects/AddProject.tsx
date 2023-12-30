import { ProjectForm } from "@/components/projects/ProjectForm";
import { Divider, Typography } from "antd";

const { Title } = Typography;

export default function AddProject() {
  return (
    <>
      <Title level={3}>Add Project</Title>
      <Divider />
      <ProjectForm />
    </>
  );
}
