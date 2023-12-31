import { ProjectTable } from "@/components/projects/ProjectTable";
import { useConflictingProjects } from "@/hooks/admins";
import { useDisapprovedProjects, useNoResponseProjects } from "@/hooks/projects";
import Await from "@/pages/Await";
import { Divider, Typography } from "antd";

const { Title, Paragraph } = Typography;

export default function ManageProjects() {
  const disapprovedProjects = useDisapprovedProjects();
  const noResponseProjects = useNoResponseProjects();
  const conflictingProjects = useConflictingProjects();

  return (
    <>
      <Title level={3}>Manage Projects</Title>
      <Divider />
      <Title level={4}>Disapproved Projects</Title>
      <Paragraph className="text-slate-500">
        Projects that have been disapproved by admins will be shown here.
      </Paragraph>
      <Await query={disapprovedProjects} errorElement="Failed to load disapproved projects">
        {(disapprovedProjects) => <ProjectTable projects={disapprovedProjects} />}
      </Await>
      <Divider />
      <Title level={4}>No Response Projects</Title>
      <Paragraph className="text-slate-500">
        Projects that have not been approved or disapproved by admins will be shown here.
      </Paragraph>
      <Await query={noResponseProjects} errorElement="Failed to load no response projects">
        {(noResponseProjects) => <ProjectTable projects={noResponseProjects} />}
      </Await>
      <Title level={4}>Conflicting Projects</Title>
      <Paragraph className="text-slate-500">
        Projects with students who have not accepted or declined their allocation will be shown here.
      </Paragraph>
      <Await query={conflictingProjects} errorElement="Failed to load conflicting projects">
        {(conflictingProjects) => <ProjectTable projects={conflictingProjects} />}
      </Await>
    </>
  );
}
