import { ProjectRead, ShortlistService } from "@/api";
import { DeleteOutlined, HolderOutlined } from '@ant-design/icons';
import { Button, Divider, List, Space, Tooltip, Typography } from "antd";
import { Reorder, useDragControls } from "framer-motion";
import { useEffect, useState } from "react";
import { Link, useLoaderData, useRevalidator } from "react-router-dom";

const { Title, Text } = Typography;

export async function shortlistedLoader() {
  return await ShortlistService.readShortlisted();
}

export default function Shortlisted() {
  const projects = useLoaderData() as ProjectRead[];

  // Framer Motion's Reorder component only works with primitive values
  // so we use project ids as state.
  const [projectIds, setProjectIds] = useState<number[]>([]);

  useEffect(() => {
    setProjectIds(projects.map((project: ProjectRead) => project.id) || []);
  }, [projects]);

  return (
    <>
      <Title level={3}>
        List of Shortlisted Projects
      </Title>
      <Divider />
      <Reorder.Group
        as="div"
        axis="y"
        values={projectIds}
        onReorder={async (projectIds) => {
          await ShortlistService.reorderShortlisted(projectIds);
          setProjectIds(projectIds);
        }}
      >
        <List
          header={<Text strong>Highest Preference</Text>}
          footer={<Text strong>Lowest Preference</Text>}
          bordered
          dataSource={projectIds}
          rowKey={(projectId: number) => projectId}
          renderItem={(projectId: number) => {
            const project = projects?.find((project: ProjectRead) => project.id === projectId);
            if (project) {
              return <ProjectItem project={project as ProjectRead} />;
            }
          }}
        />
      </Reorder.Group>
    </>
  );
}

interface ProjectItemProps {
  project: ProjectRead;
}

function ProjectItem({ project }: ProjectItemProps) {
  // Drag controls for Framer Motion's Reorder component
  const controls = useDragControls();
  const revalidator = useRevalidator();

  return (
    <Reorder.Item
      as="div"
      key={project.id}
      value={project.id}
      dragListener={false}
      dragControls={controls}
    >
      <List.Item className="flex justify-between w-full">
        <Link to={`/projects/${project.id}`} className="select-none">
          {project.title}
        </Link>
        <Space>
          <HolderOutlined onPointerDown={(event) => controls.start(event)} />
          <Tooltip title="Delete">
            <Button
              className="border-none"
              icon={<DeleteOutlined />}
              onClick={async () => {
                await ShortlistService.unsetShortlisted(project.id);
                revalidator.revalidate();
              }}
            />
          </Tooltip>
        </Space>
      </List.Item>
    </Reorder.Item>
  );
}
