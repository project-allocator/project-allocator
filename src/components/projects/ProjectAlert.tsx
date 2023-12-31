import { useAcceptAllocation, useAllocatedProject, useAllocatees, useRejectAllocation } from "@/hooks/allocations";
import { useApproveProject, useDisapproveProject, useProject } from "@/hooks/projects";
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
  const approveProject = useApproveProject(projectId!);
  const disapproveProject = useDisapproveProject(projectId!);

  if (project.isLoading || project.isError) return null;

  const isApproved = project.data?.approved;

  return (
    <Alert
      type={isApproved === null ? "warning" : isApproved ? "success" : "error"}
      message={
        isApproved === null
          ? "You have not approved or disapproved this project."
          : isApproved
            ? "You have approved this project."
            : "You have disapproved this project."
      }
      description={
        isApproved === null
          ? "You must approve or disapprove this project."
          : isApproved
            ? "You can alternatively disapprove this project proposal by clicking the button."
            : "You can alternatively approve this project proposal by clicking the button."
      }
      showIcon
      action={
        <Space direction="vertical">
          <Button
            size="small"
            type="primary"
            className="w-24"
            disabled={isApproved !== null && isApproved}
            onClick={() => approveProject.mutate()}
          >
            Approve
          </Button>
          <Button
            size="small"
            className="w-24"
            disabled={isApproved !== null && !isApproved}
            onClick={() => disapproveProject.mutate()}
          >
            Disapprove
          </Button>
        </Space>
      }
    />
  );
}

function ConflictAlert() {
  const { id: projectId } = useParams();
  const allocatees = useAllocatees(projectId!);

  if (allocatees.isLoading || allocatees.isError) return null;
  if (allocatees.data!.length == 0) return null;

  const hasConflict = allocatees.data!.some((allocatee) => !allocatee.allocation?.accepted);

  return (
    <Alert
      showIcon
      type={hasConflict ? "error" : "success"}
      message={hasConflict ? "This project has some conflicts." : "This project has no conflict."}
      description={
        hasConflict
          ? "Some students have rejected or not yet responded to their project allocation."
          : "All students have accepted their project allocation."
      }
    />
  );
}

function AllocationAlert() {
  const user = useCurrentUser();
  const allocatedProject = useAllocatedProject();
  const acceptAllocation = useAcceptAllocation();
  const rejectAllocation = useRejectAllocation();

  if (user.isLoading || user.isError) return null;
  if (allocatedProject.isLoading || allocatedProject.isError) return null;

  const isAllocated = allocatedProject !== null;
  const isAccepted = allocatedProject.data?.allocations[0]?.accepted; // only the student's allocation is returned
  const isLocked = allocatedProject.data?.allocations[0]?.locked;

  if (!isAllocated) return null;

  return (
    <Alert
      type={isAccepted === null ? "info" : isAccepted ? "success" : "error"}
      showIcon
      message={
        isLocked
          ? "This project allocation has been locked."
          : isAccepted === null
            ? "You have been allocated to this project."
            : isAccepted
              ? "You have accepted this project allocation."
              : "You have rejected this project allocation."
      }
      description={
        isLocked
          ? "You cannot change your response anymore."
          : isAccepted === null
            ? "You must accept or reject this project allocation."
            : isAccepted
              ? "You can alternatively reject this project allocation by clicking the button."
              : "You can alternatively accept this project allocation by clicking the button."
      }
      action={
        <Space direction="vertical">
          <Button
            size="small"
            type="primary"
            className="w-24"
            disabled={isLocked || (isAccepted !== null && isAccepted)}
            onClick={() => acceptAllocation.mutate()}
          >
            Accept
          </Button>
          <Button
            size="small"
            className="w-24"
            disabled={isLocked || (isAccepted !== null && !isAccepted)}
            onClick={() => rejectAllocation.mutate()}
          >
            Reject
          </Button>
        </Space>
      }
    />
  );
}
