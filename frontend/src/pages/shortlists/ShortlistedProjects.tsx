import ReorderableProjectList from "@/components/projects/ReorderableProjectList";
import { useMessage } from "@/contexts/MessageContext";
import { useReorderShortlistedProjects, useShortlistedProjects, useUnshortlistProject } from "@/hooks/shortlists";
import { Divider, Typography } from "antd";

const { Title } = Typography;

export default function ShortlistedProjects() {
  const { messageSuccess, messageError } = useMessage();
  const projects = useShortlistedProjects();
  const reorderShortlistedProjects = useReorderShortlistedProjects();
  const unshortlistProject = useUnshortlistProject();

  return (
    <>
      <Title level={3}>Shortlisted Projects</Title>
      <Divider />
      <ReorderableProjectList
        projects={projects.data!}
        onReorder={(projectIds) => {
          reorderShortlistedProjects.mutate(projectIds, {
            onSuccess: () => messageSuccess("Successfully reordered shortlisted projects."),
            onError: () => messageError("Failed to reorder shortlisted projects."),
          });
        }}
        onDelete={(projectId) => {
          unshortlistProject.mutate(projectId, {
            onSuccess: () => messageSuccess("Successfully unshortlisted project."),
            onError: () => messageError("Failed to unshortlist project."),
          });
        }}
      />
    </>
  );
}
