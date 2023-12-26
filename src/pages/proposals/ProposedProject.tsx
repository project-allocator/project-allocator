import { AdminService, ProjectRead, ProposalService } from "@/api";
import { ProjectsTable } from "@/components/ProjectTable";
import StaffRoute from "@/routes/StaffRoute";
import { PlusOutlined } from "@ant-design/icons";
import { Button, Divider, Space, Tooltip, Typography } from "antd";
import { Link, useLoaderData } from "react-router-dom";

const { Title } = Typography;

export async function proposedProjectLoader() {
  const projects = ProposalService.readProposed();
  const areProposalsShutdown = AdminService.areProposalsShutdown();
  return Promise.all([projects, areProposalsShutdown]);
}

export default function ProposedProject() {
  const [projects, areProposalsShutdown] = useLoaderData() as [ProjectRead[], boolean];

  return (
    <>
      <Space className="flex items-end justify-between">
        <Title level={3} className="mb-0">
          List of Proposed Projects
        </Title>
        {!areProposalsShutdown && (
          <StaffRoute>
            <Tooltip title="Add">
              <Link to="/projects/add">
                <Button shape="circle" icon={<PlusOutlined />} />
              </Link>
            </Tooltip>
          </StaffRoute>
        )}
      </Space>
      <Divider />
      <ProjectsTable projects={projects} />
    </>
  );
}
