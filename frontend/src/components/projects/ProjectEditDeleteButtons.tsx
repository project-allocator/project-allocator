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

  const isShutdown = proposalsShutdown.data!.value;
  const isProposed = proposedProjects.data!.some((project) => project.id === projectId);

  return (
    <Space>
      <Tooltip
        title={
          isShutdown
            ? "Project proposals are currently shutdown"
            : isProposed
              ? "Edit this project"
              : "Can only edit proposed projects"
        }
      >
        <Link to="./edit">
          <Button shape="circle" icon={<EditOutlined />} disabled={!isProposed || isShutdown} />
        </Link>
      </Tooltip>
      <Tooltip
        title={
          isShutdown
            ? "Project proposals are currently shutdown"
            : isProposed
              ? "Delete this project"
              : "Can only delete proposed projects"
        }
      >
        <Button
          shape="circle"
          icon={<DeleteOutlined />}
          disabled={!isProposed || isShutdown}
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
