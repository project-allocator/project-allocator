import { ProjectTable } from "@/components/projects/ProjectTable";
import { useConfig } from "@/hooks/configs";
import { useProposedProjects } from "@/hooks/proposals";
import { useCurrentUserRole } from "@/hooks/users";
import Await from "@/pages/Await";
import { PlusOutlined } from "@ant-design/icons";
import { Button, Divider, Space, Tooltip, Typography } from "antd";
import { Link } from "react-router-dom";

const { Title } = Typography;

export default function ProposedProjects() {
  const { isAdmin, isStaff } = useCurrentUserRole();
  const projects = useProposedProjects();
  const proposalsShutdown = useConfig("proposals_shutdown");

  if (proposalsShutdown.isLoading || proposalsShutdown.isError) return null;

  return (
    <>
      <Space className="flex items-end justify-between">
        <Title level={3} className="mb-0">
          Proposed Projects
        </Title>
        {(isStaff || isAdmin) && !proposalsShutdown.data!.value && (
          <Tooltip title="Add">
            <Link to="/projects/add">
              <Button shape="circle" icon={<PlusOutlined />} />
            </Link>
          </Tooltip>
        )}
      </Space>
      <Divider />
      <Await query={projects} errorElement="Failed to load projects">
        {(projects) => <ProjectTable projects={projects} />}
      </Await>
    </>
  );
}
