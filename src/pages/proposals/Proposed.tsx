import { ProposalService } from '@/api';
import { ProjectsTable } from '@/components/ProjectTable';
import StaffRoute from '@/routes/StaffRoute';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Divider, Space, Tooltip, Typography } from "antd";
import { Link } from "react-router-dom";

const { Title } = Typography;

export async function proposedLoader() {
  return await ProposalService.readProposed()
}

export default function Proposed() {
  return (
    <>
      <Space className="flex items-end justify-between">
        <Title level={3} className="mb-0">
          List of Proposed Projects
        </Title>
        <StaffRoute>
          <Tooltip title="Add">
            <Link to="/projects/add" >
              <Button shape="circle" icon={<PlusOutlined />} />
            </Link>
          </Tooltip>
        </StaffRoute>
      </Space>
      <Divider />
      <ProjectsTable />
    </>
  );
}