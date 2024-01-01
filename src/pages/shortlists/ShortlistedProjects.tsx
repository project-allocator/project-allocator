import { ProjectRead } from "@/api";
import { useMessage } from "@/contexts/MessageContext";
import { useReorderShortlistedProjects, useShortlistedProjects, useUnshortlistProject } from "@/hooks/shortlists";
import { DeleteOutlined, HolderOutlined } from "@ant-design/icons";
import { Button, Divider, List, Space, Tooltip, Typography } from "antd";
import { Reorder, useDragControls } from "framer-motion";
import { Link } from "react-router-dom";

const { Title, Text } = Typography;

export default function ShortlistedProjects() {
  const { messageSuccess, messageError } = useMessage();
  const projects = useShortlistedProjects();
  const reorderShortlistedProjects = useReorderShortlistedProjects();

  // We use Framer Motion's Reorder component for drag and drop,
  // but this only works with primitive values so we use project ids, rather than ProjectRead[].
  const projectIds = projects.data?.map((project: ProjectRead) => project.id) ?? [];

  return (
    <>
      <Title level={3}>Shortlisted Projects</Title>
      <Divider />
      <Reorder.Group
        as="div"
        axis="y"
        values={projectIds}
        onReorder={(projectIds) => {
          reorderShortlistedProjects.mutate(projectIds, {
            onSuccess: () => messageSuccess("Successfully reordered shortlisted projects."),
            onError: () => messageError("Failed to reorder shortlisted projects."),
          });
        }}
      >
        <List
          header={<Text strong>Highest Preference</Text>}
          footer={<Text strong>Lowest Preference</Text>}
          bordered
          dataSource={projectIds}
          rowKey={(projectId: string) => projectId}
          renderItem={(projectId: string) => (
            <ShortlistedProjectItem
              project={projects.data!.find((project: ProjectRead) => project.id === projectId)!}
            />
          )}
        />
      </Reorder.Group>
    </>
  );
}

function ShortlistedProjectItem({ project }: { project: ProjectRead }) {
  // Drag controls for Framer Motion's Reorder component
  const controls = useDragControls();
  const { messageSuccess, messageError } = useMessage();

  const unshortlistProject = useUnshortlistProject();

  return (
    <Reorder.Item as="div" key={project.id} value={project.id} dragListener={false} dragControls={controls}>
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
              onClick={() => {
                unshortlistProject.mutate(project.id, {
                  onSuccess: () => messageSuccess("Successfully unshortlisted project."),
                  onError: () => messageError("Failed to unshortlist project."),
                });
              }}
            />
          </Tooltip>
        </Space>
      </List.Item>
    </Reorder.Item>
  );
}
