import { useAllocatedProject } from "@/hooks/allocations";
import { Empty, Typography } from "antd";
import { Navigate } from "react-router-dom";
import Await from "../Await";

const { Title } = Typography;

export default function AllocatedProject() {
  const project = useAllocatedProject();

  return (
    <>
      <Title level={3}>Allocated Project</Title>
      <Await query={project} errorElement="Failed to load allocated project">
        {(project) => (project ? <Navigate to={`/projects/${project.id}`} /> : <Empty />)}
      </Await>
    </>
  );
}
