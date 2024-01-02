import { useMessage } from "@/contexts/MessageContext";
import { useAcceptAllocation, useAllocatedProject, useAllocatees, useRejectAllocation } from "@/hooks/allocations";
import { useApproveProject, useDisapproveProject, useProject } from "@/hooks/projects";
import { useAuth } from "@/hooks/users";
import { Alert, Button, Space } from "antd";
import { Suspense } from "react";
import { useParams } from "react-router-dom";

export default function ProjectAlert() {
  const { isAdmin, isStaff, isStudent } = useAuth();

  return (
    <Space direction="vertical" className="w-full">
      {isAdmin && (
        <Suspense>
          <ApprovalAlert />
        </Suspense>
      )}
      {(isStaff || isAdmin) && (
        <Suspense>
          <ConflictAlert />
        </Suspense>
      )}
      {isStudent && (
        <Suspense>
          <AllocationAlert />
        </Suspense>
      )}
    </Space>
  );
}

function ApprovalAlert() {
  const { messageSuccess, messageError } = useMessage();
  const { id: projectId } = useParams();

  const project = useProject(projectId!);
  const approveProject = useApproveProject(projectId!);
  const disapproveProject = useDisapproveProject(projectId!);

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
            onClick={() =>
              approveProject.mutate(undefined, {
                onSuccess: () => messageSuccess("Successfully approved project"),
                onError: () => messageError("Failed to approve project"),
              })
            }
          >
            Approve
          </Button>
          <Button
            size="small"
            className="w-24"
            disabled={isApproved !== null && !isApproved}
            onClick={() =>
              disapproveProject.mutate(undefined, {
                onSuccess: () => messageSuccess("Successfully disapproved project"),
                onError: () => messageError("Failed to disapprove project"),
              })
            }
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

  // Hide if project has no allocations.
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
  const { messageSuccess, messageError } = useMessage();

  const allocatedProject = useAllocatedProject();
  const acceptAllocation = useAcceptAllocation();
  const rejectAllocation = useRejectAllocation();

  const isAllocated = allocatedProject.data !== null;
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
            onClick={() =>
              acceptAllocation.mutate(undefined, {
                onSuccess: () => messageSuccess("Successfully accepted project allocation"),
                onError: () => messageError("Failed to accept project allocation"),
              })
            }
          >
            Accept
          </Button>
          <Button
            size="small"
            className="w-24"
            disabled={isLocked || (isAccepted !== null && !isAccepted)}
            onClick={() =>
              rejectAllocation.mutate(undefined, {
                onSuccess: () => messageSuccess("Successfully rejected project allocation"),
                onError: () => messageError("Failed to reject project allocation"),
              })
            }
          >
            Reject
          </Button>
        </Space>
      }
    />
  );
}
