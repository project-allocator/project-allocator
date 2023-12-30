import { ProjectsTable } from "@/components/projects/ProjectTable";
import { useConflictingProjects } from "@/hooks/admins";
import { useProjects } from "@/hooks/projects";
import Loading from "@/pages/Loading";
import { Divider, Typography } from "antd";

const { Title, Paragraph } = Typography;

export default function ManageProjects() {
  const nonApprovedProjects = useProjects(false);
  const conflictingProjects = useConflictingProjects();

  if (nonApprovedProjects.isLoading || conflictingProjects.isLoading) return <Loading />;
  if (nonApprovedProjects.isError || conflictingProjects.isError) return null;

  return (
    <>
      <Title level={3}>Manage Projects</Title>
      <Divider />
      <Title level={4}>Non-Approved Projects</Title>
      <Paragraph className="text-slate-500">
        Projects that have not been rejected or not yet approved by administrators will be shown here.
      </Paragraph>
      <ProjectsTable projects={nonApprovedProjects.data!} />
      <Divider />
      <Title level={4}>Conflicting Projects</Title>
      <Paragraph className="text-slate-500">
        Projects with students who have not accepted or declined their allocation will be shown here.
      </Paragraph>
      <ProjectsTable projects={conflictingProjects.data!} />
    </>
  );
}
