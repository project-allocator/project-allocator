import { useMessage } from "@/contexts/MessageContext";
import { useConfig } from "@/hooks/configs";
import { useDeleteProject } from "@/hooks/projects";
import { useProposedProjects } from "@/hooks/proposals";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Space, Tooltip } from "antd";
import { Link, useNavigate, useParams } from "react-router-dom";

export default function EditDeleteButtons() {
  const navigate = useNavigate();
  const { messageSuccess, messageError } = useMessage();

  const { id: projectId } = useParams();
  const proposalsShutdown = useConfig("proposals_shutdown");
  const proposedProjects = useProposedProjects();
  const deleteUser = useDeleteProject(projectId!);

  if (proposalsShutdown.data!.value) return null;

  const isProposed = proposedProjects.data!.some((project) => project.id === projectId);
  if (!isProposed) return null;

  return (
    <Space>
      <Tooltip title="Edit">
        <Link to="./edit">
          <Button shape="circle" icon={<EditOutlined />} />
        </Link>
      </Tooltip>
      <Tooltip title="Delete">
        <Button
          shape="circle"
          icon={<DeleteOutlined />}
          onClick={() => {
            deleteUser.mutate(undefined, {
              onSuccess: () => {
                messageSuccess(`Successfully deleted project.`);
                navigate("/projects");
              },
              onError: () => messageError(`Failed to delete project.`),
            });
          }}
        />
      </Tooltip>
    </Space>
  );
}
