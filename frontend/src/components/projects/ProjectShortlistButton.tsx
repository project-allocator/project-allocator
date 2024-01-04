import { useMessage } from "@/contexts/MessageContext";
import { useConfig } from "@/hooks/configs";
import { useProject } from "@/hooks/projects";
import { useShortlistProject, useShortlistedProjects, useUnshortlistProject } from "@/hooks/shortlists";
import { HeartOutlined } from "@ant-design/icons";
import { Button, Tooltip } from "antd";
import { useParams } from "react-router-dom";

export default function ProjectShortlistButton() {
  const { messageSuccess, messageError } = useMessage();
  const { id: projectId } = useParams();

  const project = useProject(projectId!);
  const shortlistedProjects = useShortlistedProjects();
  const maxShortlists = useConfig("max_shortlists");
  const shortlistShutdown = useConfig("shortlists_shutdown");

  const shortlistProject = useShortlistProject();
  const unshortlistProject = useUnshortlistProject();

  const isShutdown = shortlistShutdown.data!.value;
  const isMaxReached = shortlistedProjects.data!.length >= maxShortlists.data!.value;
  const isShortlisted = shortlistedProjects.data!.some((project) => project.id === projectId);

  return (
    <Tooltip
      title={
        isShutdown
          ? "Shortlists are currently shutdown"
          : isMaxReached
            ? "You cannot shortlist any more projects"
            : isShortlisted
              ? "Unshortlist this project"
              : "Shortlist this project"
      }
    >
      <Button
        shape="circle"
        icon={<HeartOutlined />}
        disabled={isShutdown || isMaxReached}
        type={isShortlisted ? "primary" : "default"}
        onClick={() =>
          isShortlisted
            ? unshortlistProject.mutate(projectId!, {
                onSuccess: () => messageSuccess(`Successfully unshortlisted project.`),
                onError: () => messageError(`Failed to unshortlist project.`),
              })
            : shortlistProject.mutate(project.data!, {
                onSuccess: () => messageSuccess(`Successfully shortlisted project.`),
                onError: () => messageError(`Failed to shortlist project.`),
              })
        }
      />
    </Tooltip>
  );
}
