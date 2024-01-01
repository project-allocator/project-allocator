import { ProjectTable } from "@/components/projects/ProjectTable";
import { useConflictingProjects } from "@/hooks/admins";
import { useDisapprovedProjects, useNoResponseProjects } from "@/hooks/projects";
import { Divider, Skeleton, Typography } from "antd";
import { Suspense } from "react";

const { Title, Paragraph } = Typography;

export default function ManageProjects() {
  return (
    <>
      <Title level={3}>Manage Projects</Title>
      <Divider />
      <Suspense fallback={<Skeleton active />}>
        <DisapprovedProjects />
      </Suspense>
      <Divider />
      <Suspense fallback={<Skeleton active />}>
        <NoResponseProjects />
      </Suspense>
      <Divider />
      <Suspense fallback={<Skeleton active />}>
        <ConflictingProjects />
      </Suspense>
    </>
  );
}

function DisapprovedProjects() {
  const disapprovedProjects = useDisapprovedProjects();

  return (
    <>
      <Title level={4}>Disapproved Projects</Title>
      <Paragraph className="text-slate-500">
        Projects that have been disapproved by admins will be shown here.
      </Paragraph>
      <ProjectTable projects={disapprovedProjects.data} />
    </>
  );
}

function NoResponseProjects() {
  const noResponseProjects = useNoResponseProjects();

  return (
    <>
      <Title level={4}>No Response Projects</Title>
      <Paragraph className="text-slate-500">
        Projects that have not been approved or disapproved by admins will be shown here.
      </Paragraph>
      <ProjectTable projects={noResponseProjects.data} />
    </>
  );
}

function ConflictingProjects() {
  const conflictingProjects = useConflictingProjects();

  return (
    <>
      <Title level={4}>Conflicting Projects</Title>
      <Paragraph className="text-slate-500">
        Projects with students who have not accepted or declined their allocation will be shown here.
      </Paragraph>
      <ProjectTable projects={conflictingProjects.data} />
    </>
  );
}
