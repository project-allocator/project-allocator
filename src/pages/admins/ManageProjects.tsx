import { AllocationService, ProjectRead, ProjectService } from "@/api";
import { ProjectsTable } from "@/components/ProjectTable";
import { Divider, Typography } from "antd";
import { useLoaderData } from "react-router-dom";

const { Title, Paragraph } = Typography;

export async function manageProjectsLoader() {
  const nonApprovedProjects = ProjectService.readNonApprovedProjects();
  const conflictingProjects = AllocationService.readConflictingProjects();
  return Promise.all([nonApprovedProjects, conflictingProjects]);
}

export default function ManageProjects() {
  const [nonApprovedProjects, conflictingProjects] = useLoaderData() as [ProjectRead[], ProjectRead[]];

  return (
    <>
      <Title level={3}>Manage Projects</Title>
      <Divider />
      <Title level={4}>Non-Approved Projects</Title>
      <Paragraph className="text-slate-500">
        Projects that have not been rejected or not yet approved by administrators will be shown here.
      </Paragraph>
      <ProjectsTable projects={nonApprovedProjects} />
      <Divider />
      <Title level={4}>Conflicting Projects</Title>
      <Paragraph className="text-slate-500">
        Projects with students who have not accepted or declined their allocation will be shown here.
      </Paragraph>
      <ProjectsTable projects={conflictingProjects} />
    </>
  );
}
