import { ProjectRead } from "@/api";
import { DeleteOutlined, HolderOutlined } from "@ant-design/icons";
import { Button, List, Space, Tooltip, Typography } from "antd";
import { Reorder, useDragControls } from "framer-motion";
import { Link } from "react-router-dom";

const { Text } = Typography;

export default function ReorderableProjectList({
  projects,
  onReorder,
  onDelete,
}: {
  projects: ProjectRead[];
  onReorder: (projectIds: string[]) => void;
  onDelete: (projectId: string) => void;
}) {
  // We use Framer Motion's Reorder component for drag and drop,
  // but this only works with primitive values so we use project ids, rather than ProjectRead[].
  const projectIds = projects.map((project: ProjectRead) => project.id) ?? [];

  return (
    <Reorder.Group as="div" axis="y" values={projectIds} onReorder={onReorder}>
      <List
        header={<Text strong>Highest Preference</Text>}
        footer={<Text strong>Lowest Preference</Text>}
        bordered
        dataSource={projectIds}
        rowKey={(projectId) => projectId}
        renderItem={(projectId) => (
          <ReorderableProjectListItem
            project={projects.find((project) => project.id === projectId)!}
            onDelete={onDelete}
          />
        )}
      />
    </Reorder.Group>
  );
}

function ReorderableProjectListItem({
  project,
  onDelete,
}: {
  project: ProjectRead;
  onDelete: (projectId: string) => void;
}) {
  // Drag controls for Framer Motion's Reorder component
  const controls = useDragControls();

  return (
    <Reorder.Item as="div" key={project.id} value={project.id} dragListener={false} dragControls={controls}>
      <List.Item className="flex justify-between w-full">
        <Link to={`/projects/${project.id}`} className="select-none">
          {project.title}
        </Link>
        <Space>
          <HolderOutlined onPointerDown={(event) => controls.start(event)} />
          <Tooltip title="Delete">
            <Button icon={<DeleteOutlined />} onClick={() => onDelete(project.id)} className="border-none" />
          </Tooltip>
        </Space>
      </List.Item>
    </Reorder.Item>
  );
}
