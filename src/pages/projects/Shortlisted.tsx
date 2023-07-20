import client from "@/services/api";
import type { Project } from "@/types";
import { DeleteOutlined, HolderOutlined } from '@ant-design/icons';
import { Button, Divider, List, Space, Tooltip, Typography } from "antd";
import { Reorder, useDragControls } from "framer-motion";
import { useEffect, useState } from "react";
import { useLoaderData } from "react-router-dom";

const { Title } = Typography;

export async function loader() {
  const { data } = await client.get('/projects/');
  return data;
}

export default function Shortlisted() {
  const projects = useLoaderData() as Project[];

  // Framer Motion's Reorder component only works with primitive values
  // so we use project ids as state.
  const [projectIds, setProjectIds] = useState<number[]>([]);

  useEffect(() => {
    setProjectIds(projects.map((project: Project) => project.id) || []);
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
        onReorder={setProjectIds}
      >
        <List
          header={<div>Header</div>}
          footer={<div>Footer</div>}
          bordered
          dataSource={projectIds}
          rowKey={(projectId: number) => projectId}
          renderItem={(projectId: number) => {
            const project = projects?.find(
              (project: Project) => project.id === projectId
            ) as Project;
            return <ProjectItem project={project} />;
          }}
        />
      </Reorder.Group>
    </>
  );
}

interface ProjectItemProps {
  project: Project;
}

function ProjectItem({ project }: ProjectItemProps) {
  // Drag controls for Framer Motion's Reorder component
  const controls = useDragControls();

  return (
    <Reorder.Item
      as="div"
      key={project.id}
      value={project.id}
      dragListener={false}
      dragControls={controls}
    >
      <List.Item className="flex justify-between w-full">
        <span className="select-none">{project.title}</span>
        <Space>
          <HolderOutlined onPointerDown={(event) => controls.start(event)} />
          <Tooltip title="Delete">
            <Button className="border-none" icon={<DeleteOutlined />} />
          </Tooltip>
        </Space>
      </List.Item>
    </Reorder.Item>
  );
}
