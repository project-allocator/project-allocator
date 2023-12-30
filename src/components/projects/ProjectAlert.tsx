import { AllocationService } from "@/api";
import { useAllocatees, useResetAllocationStatus, useSetAllocationStatus } from "@/hooks/allocations";
import { useConfig } from "@/hooks/configs";
import {
  useIsProjectAccepted,
  useIsProjectAllocated,
  useProject,
  useResetProjectStatus,
  useSetProjectStatus,
} from "@/hooks/projects";
import { useCurrentUser, useCurrentUserRole } from "@/hooks/users";
import { Alert, Button, Space } from "antd";
import { useParams } from "react-router-dom";

export default function ProjectAlert() {
  const user = useCurrentUser();
  const { isAdmin, isStaff, isStudent } = useCurrentUserRole();

  // TODO: isError checks for other components
  if (user.isLoading || user.isError) return null;

  return (
    <Space direction="vertical" className="w-full">
      {isAdmin && <ApprovalAlert />}
      {(isStaff || isAdmin) && <ConflictAlert />}
      {isStudent && <AllocationAlert />}
    </Space>
  );
}

function ApprovalAlert() {
  const { id: projectId } = useParams();
  const project = useProject(projectId!);
  const setProjectStatus = useSetProjectStatus(projectId!);
  const resetProjectStatus = useResetProjectStatus(projectId!);

  if (project.isLoading || project.isError) return null;

  return project.data!.approved === null ? (
    <Alert
      type="warning"
      message="This project allocation has not been approved."
      description="Administrators must approve or reject this project proposal."
      showIcon
      action={
        <Space direction="vertical">
          <Button
            size="small"
            type="primary"
            className="w-20"
            onClick={() => setProjectStatus.mutate({ approved: true })}
          >
            Approve
          </Button>
          <Button size="small" className="w-20" onClick={() => setProjectStatus.mutate({ approved: false })}>
            Reject
          </Button>
        </Space>
      }
    />
  ) : (
    <Alert
      type="info"
      showIcon
      message={
        project.data?.approved ? "You have approved this project proposal." : "You have rejected this project proposal."
      }
      description="Staff member who proposed this project will be notified shortly."
      action={
        <Button size="small" type="primary" className="w-20" onClick={() => resetProjectStatus.mutate()}>
          Reset
        </Button>
      }
    />
  );
}

function ConflictAlert() {
  const { id: projectId } = useParams();
  const allocatees = useAllocatees(projectId!);

  if (allocatees.isLoading || allocatees.isError) return null;
  if (allocatees.data!.length == 0) return null;

  const hasConflict = allocatees.data!.some((allocatee) => !allocatee.accepted);

  return hasConflict ? (
    <Alert
      type="error"
      showIcon
      message="This project allocation has a conflict."
      description="There are students who declined or did not respond to this project allocation."
    />
  ) : (
    <Alert
      type="success"
      showIcon
      message="This project allocation has no conflict."
      description="Every student allocated to this project has accepted this project allocation."
    />
  );
}

function AllocationAlert() {
  const { id: projectId } = useParams();
  const user = useCurrentUser();
  const resetsShutdown = useConfig("resets_shutdown");
  const isAllocated = useIsProjectAllocated(projectId!);
  const isAccepted = useIsProjectAccepted(projectId!);
  const setAllocationStatus = useSetAllocationStatus(projectId!);
  const resetAllocationStatus = useResetAllocationStatus(projectId!);

  if (user.isLoading || user.isError) return null;
  if (isAllocated.isLoading || isAllocated.isError || !isAllocated.data) return null;
  if (isAccepted.isLoading || isAccepted.isError) return null;

  return isAccepted.data === null ? (
    <Alert
      type="info"
      showIcon
      message="You have been allocated to this project."
      description="Please accept or decline this project allocation."
      action={
        <Space direction="vertical">
          <Button
            size="small"
            type="primary"
            className="w-20"
            onClick={() => setAllocationStatus.mutate({ accepted: true })}
          >
            Accept
          </Button>
          <Button
            size="small"
            className="w-20"
            onClick={() => {
              AllocationService.setAllocationStatus({ accepted: false });
            }}
          >
            Decline
          </Button>
        </Space>
      }
    />
  ) : (
    <Alert
      type="info"
      showIcon
      message={
        isAccepted.data ? "You have accepted this project allocation." : "You have declined this project allocation."
      }
      description="Contact your administrators for further information."
      action={
        !resetsShutdown.data?.value && (
          <Button size="small" type="primary" className="w-20" onClick={() => resetAllocationStatus.mutate()}>
            Reset
          </Button>
        )
      }
    />
  );
}
