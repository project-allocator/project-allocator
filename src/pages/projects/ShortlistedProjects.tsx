import Loading from "@/components/Loading";
import MessageContext from "@/contexts/message";
import { getData } from "@/services/client";
import { ProjectRead } from "@/services/projects";
import { showErrorMessage } from "@/utils";
import { DeleteOutlined, HolderOutlined } from '@ant-design/icons';
import { Button, Divider, List, Space, Tooltip, Typography } from "antd";
import { Reorder, useDragControls } from "framer-motion";
import { useContext, useEffect, useState } from "react";

const { Title } = Typography;

export default function ShortlistedProjects() {
  // Call the internal Graph QL API
  const { data, loading, error } = getData();
  const projects = data?.projects;

  // Framer Motion's Reorder component only works with primitive values
  // so we use project ids as state.
  const [projectIds, setProjectIds] = useState<number[]>([]);

  useEffect(() => {
    setProjectIds(projects?.map((project: ProjectRead) => project.id) || []);
  }, [projects]);

  const message = useContext(MessageContext)!;
  if (loading) return <Loading />;
  if (error) showErrorMessage(message, error);

  return (
    <>
      <Title level={3}>Shortlisted Projects</Title>
      <Divider />
      <Reorder.Group
        as="div"
        axis="y"
        values={projectIds}
        onReorder={setProjectIds}
      >
        <List
          // header={<div>Header</div>}
          // footer={<div>Footer</div>}
          bordered
          dataSource={projectIds}
          rowKey={(projectId: number) => projectId}
          renderItem={(projectId: number) => {
            const project = projects?.find(
              (project: ProjectRead) => project.id === projectId
            ) as ProjectRead;
            return <ProjectItem project={project} />;
          }}
        />
      </Reorder.Group>
    </>
  );
}

interface Props {
  project: ProjectRead;
}

function ProjectItem({ project }: Props) {
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
