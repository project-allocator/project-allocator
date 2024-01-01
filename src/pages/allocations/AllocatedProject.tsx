import { useAllocatedProject } from "@/hooks/allocations";
import { Empty, Typography } from "antd";
import { Navigate } from "react-router-dom";

const { Title } = Typography;

export default function AllocatedProject() {
  const project = useAllocatedProject();

  return (
    <>
      <Title level={3}>Allocated Project</Title>
      {project.data ? <Navigate to={`/projects/${project.data!.id}`} /> : <Empty />}
    </>
  );
}
