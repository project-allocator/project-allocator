import { useMessage } from "@/contexts/MessageContext";
import { useConfig } from "@/hooks/configs";
import { useShortlistProject, useShortlistedProjects, useUnshortlistProject } from "@/hooks/shortlists";
import { HeartOutlined } from "@ant-design/icons";
import { Button, Tooltip } from "antd";
import { useParams } from "react-router-dom";

export default function ProjectShortlistButton() {
  const { messageSuccess, messageError } = useMessage();

  const maxShortlists = useConfig("max_shortlists");
  const shortlistShutdown = useConfig("shortlists_shutdown");

  const shortlistedProjects = useShortlistedProjects();
  const { id: projectId } = useParams();
  const shortlistProject = useShortlistProject(projectId!);
  const unshortlistProject = useUnshortlistProject(projectId!);

  if (maxShortlists.isLoading || maxShortlists.isError) return null;
  if (shortlistShutdown.isLoading || shortlistShutdown.isError || shortlistShutdown.data?.value) return null;
  if (shortlistedProjects.isLoading || shortlistedProjects.isError) return null;

  const isShortlisted = shortlistedProjects.data!.some((project) => project.id === projectId);

  return (
    <Tooltip title="Shortlist">
      <Button
        shape="circle"
        icon={<HeartOutlined />}
        disabled={maxShortlists.data!.value >= shortlistedProjects.data!.length}
        type={isShortlisted ? "primary" : "default"}
        onClick={() =>
          // TODO: Toggle shortlisted?
          isShortlisted
            ? unshortlistProject.mutate(undefined, {
                onSuccess: () => messageSuccess(`Successfully unshortlisted project.`),
                onError: () => messageError(`Failed to unshortlist project.`),
              })
            : shortlistProject.mutate(undefined, {
                onSuccess: () => messageSuccess(`Successfully shortlisted project.`),
                onError: () => messageError(`Failed to shortlist project.`),
              })
        }
      />
    </Tooltip>
  );
}
