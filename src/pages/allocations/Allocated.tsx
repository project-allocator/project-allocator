import { AllocationService, ProjectRead, ShortlistService } from '@/api';
import { ProjectView } from '@/components/ProjectView';
import { HeartOutlined } from '@ant-design/icons';
import { Button, Divider, Empty, Space, Tag, Tooltip, Typography } from "antd";
import { useLoaderData, useRevalidator } from 'react-router-dom';

const { Title } = Typography;

export async function allocatedLoader() {
  const project = await AllocationService.readAllocated();
  const isShortlisted = project ? await ShortlistService.isShortlisted(project.id) : false;
  return [project, isShortlisted]
}

export default function Allocated() {
  const [project, isShortlisted] = useLoaderData() as [ProjectRead, boolean];
  const revalidator = useRevalidator();

  return (
    <>
      <Space className="flex items-end justify-between">
        <Title level={3} className="mb-0">
          Allocated Project
        </Title>
        {project &&
          <Space>
            <Tag color="success">Allocated</Tag>
            <Tooltip title="Shortlist">
              <Button
                shape="circle"
                icon={<HeartOutlined />}
                type={isShortlisted ? "primary" : "default"}
                onClick={async () => {
                  await !isShortlisted
                    ? ShortlistService.setShortlisted(project.id)
                    : ShortlistService.unsetShortlisted(project.id);
                  revalidator.revalidate();
                }}
              />
            </Tooltip>
          </Space>
        }
      </Space >
      <Divider />
      {
        project
          ? <ProjectView project={project} />
          : <Empty />
      }
    </>
  );
}