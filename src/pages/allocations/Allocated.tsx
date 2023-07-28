import { AllocationService, ProjectRead, ShortlistService } from '@/api';
import { ProjectView } from '@/components/ProjectView';
import { CheckOutlined, HeartOutlined } from '@ant-design/icons';
import { Button, Divider, Empty, Space, Tooltip, Typography } from "antd";
import { useState } from 'react';
import { useLoaderData } from 'react-router-dom';

const { Title } = Typography;

export async function allocatedLoader() {
  const project = await AllocationService.readAllocated();
  const isShortlisted = project ? await ShortlistService.isShortlisted(project.id) : false;
  return [project, isShortlisted]
}

export default function Allocated() {
  const [project, isShortlisted] = useLoaderData() as [ProjectRead, boolean];
  const [isShortlistedState, setIsShortlistedState] = useState(isShortlisted);

  return (
    <>
      <Space className="flex items-end justify-between">
        <Title level={3} className="mb-0">
          Allocated Project
        </Title>
        {project &&
          <Space>
            <Tooltip title="Allocated">
              <Button
                shape="circle"
                type="primary"
                icon={<CheckOutlined />}
              />
            </Tooltip>
            <Tooltip title="Shortlist">
              <Button
                shape="circle"
                icon={<HeartOutlined />}
                type={isShortlistedState ? "primary" : "default"}
                onClick={() => {
                  !isShortlistedState
                    ? ShortlistService.setShortlisted(project.id)
                    : ShortlistService.unsetShortlisted(project.id);
                  setIsShortlistedState(isShortlistedState);
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