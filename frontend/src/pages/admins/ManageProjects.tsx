import { ProjectTable } from "@/components/projects/ProjectTable";
import { useMessage } from "@/contexts/MessageContext";
import { useConflictingProjects } from "@/hooks/admins";
import { useConfig, useUpdateConfig } from "@/hooks/configs";
import { useDisapprovedProjects, useNonApprovedProjects } from "@/hooks/projects";
import { Divider, Skeleton, Switch, Typography } from "antd";
import { Suspense } from "react";

const { Title, Paragraph } = Typography;

export default function ManageProjects() {
  return (
    <>
      <Title level={3}>Manage Projects</Title>
      <Divider />
      <Suspense fallback={<Skeleton active />}>
        <AutoApproveProjects />
      </Suspense>
      <Suspense fallback={<Skeleton active />}>
        <DisapprovedProjects />
      </Suspense>
      <Divider />
      <Suspense fallback={<Skeleton active />}>
        <NonApprovedProjects />
      </Suspense>
      <Divider />
      <Suspense fallback={<Skeleton active />}>
        <ConflictingProjects />
      </Suspense>
    </>
  );
}

function AutoApproveProjects() {
  const { messageSuccess, messageError } = useMessage();

  const defaultApproved = useConfig("default_approved");
  const updateDefaultApproved = useUpdateConfig("default_approved");

  return (
    <>
      <Title level={4}>Auto-approve Projects</Title>
      <Paragraph className="text-slate-500">Turn this on to automatically approve projects when proposed.</Paragraph>
      <Switch
        defaultChecked={defaultApproved.data.value}
        onChange={() =>
          updateDefaultApproved.mutate(!defaultApproved.data.value, {
            onSuccess: () => messageSuccess("Successfully set auto-approve projects"),
            onError: () => messageError("Failed to set auto-approve projects"),
          })
        }
      />
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

function NonApprovedProjects() {
  const nonApprovedProjects = useNonApprovedProjects();

  return (
    <>
      <Title level={4}>Non-approved Projects</Title>
      <Paragraph className="text-slate-500">
        Projects that have not been approved or disapproved by admins will be shown here.
      </Paragraph>
      <ProjectTable projects={nonApprovedProjects.data} />
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
