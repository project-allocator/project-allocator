import { useMessage } from "@/contexts/MessageContext";
import { useConfig } from "@/hooks/configs";
import {
  useIsProjectShortlisted,
  useShortlistProject,
  useShortlistedProjects,
  useUnshortlistProject,
} from "@/hooks/shortlists";
import { HeartOutlined } from "@ant-design/icons";
import { Button, Tooltip } from "antd";
import { useParams } from "react-router-dom";

export default function ProjectShortlistButton() {
  const { messageSuccess, messageError } = useMessage();

  const maxShortlists = useConfig("max_shortlists");
  const shortlistShutdown = useConfig("shortlists_shutdown");

  const { id: projectId } = useParams();
  const isShortlisted = useIsProjectShortlisted(projectId!);
  const shortlistedProjects = useShortlistedProjects();
  const shortlistProject = useShortlistProject(projectId!);
  const unshortlistProject = useUnshortlistProject(projectId!);

  if (maxShortlists.isLoading || maxShortlists.isError) return null;
  if (shortlistShutdown.isLoading || shortlistShutdown.isError || shortlistShutdown.data?.value) return null;
  if (shortlistedProjects.isLoading || shortlistedProjects.isError) return null;
  if (isShortlisted.isLoading || isShortlisted.isError) return null;

  return (
    <Tooltip title="Shortlist">
      <Button
        shape="circle"
        icon={<HeartOutlined />}
        disabled={maxShortlists.data!.value >= shortlistedProjects.data!.length}
        type={isShortlisted.data ? "primary" : "default"}
        onClick={() =>
          // TODO: Toggle shortlisted?
          isShortlisted.data
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
