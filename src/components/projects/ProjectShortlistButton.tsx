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

  const maxShortlists = useConfig("max_shortlists");
  const shortlistShutdown = useConfig("shortlists_shutdown");

  const project = useProject(projectId!);
  const shortlistedProjects = useShortlistedProjects();
  const shortlistProject = useShortlistProject();
  const unshortlistProject = useUnshortlistProject();

  if (maxShortlists.isLoading || maxShortlists.isError) return null;
  if (shortlistShutdown.isLoading || shortlistShutdown.isError) return null;
  if (project.isLoading || project.isError) return null;
  if (shortlistedProjects.isLoading || shortlistedProjects.isError) return null;
  if (shortlistShutdown.data!.value) return null;

  const isShortlisted = shortlistedProjects.data!.some((project) => project.id === projectId);

  return (
    <Tooltip title="Shortlist">
      <Button
        shape="circle"
        icon={<HeartOutlined />}
        disabled={shortlistedProjects.data!.length >= maxShortlists.data!.value}
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
