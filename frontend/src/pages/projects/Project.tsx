import ProjectAlert from "@/components/projects/ProjectAlert";
import ProjectDetails from "@/components/projects/ProjectDetails";
import ProjectEditDeleteButtons from "@/components/projects/ProjectEditDeleteButtons";
import ProjectShortlistButton from "@/components/projects/ProjectShortlistButton";
import EditableUserList from "@/components/users/EditableUserList";
import UserList from "@/components/users/UserList";
import { useMessage } from "@/contexts/MessageContext";
import { useAddAllocatees, useAllocatees, useNonAllocatees, useRemoveAllocatee } from "@/hooks/allocations";
import { useProject } from "@/hooks/projects";
import { useProposer } from "@/hooks/proposals";
import { useShortlisters } from "@/hooks/shortlists";
import { useAuth, usePrefetchUser } from "@/hooks/users";
import { Divider, Skeleton, Space, Typography } from "antd";
import { Suspense } from "react";
import { Link, useParams } from "react-router-dom";

const { Title, Paragraph } = Typography;

export default function Project() {
  const { isAdmin, isStaff, isStudent } = useAuth();

  const { id: projectId } = useParams();
  const project = useProject(projectId!);

  return (
    <>
      <Suspense>
        <ProjectAlert />
      </Suspense>
      <Space className="flex items-center justify-between my-6">
        <Title level={3} className="my-0">
          Project Overview
        </Title>
        {isStudent && (
          <Suspense>
            <ProjectShortlistButton />
          </Suspense>
        )}
        {(isStaff || isAdmin) && (
          <Suspense>
            <ProjectEditDeleteButtons />
          </Suspense>
        )}
      </Space>
      <Divider />
      <Title level={4}>{project.data!.title}</Title>
      <Paragraph className="mt-8 whitespace-pre-line">{project.data!.description}</Paragraph>
      <Divider />
      <Suspense fallback={<Skeleton active />}>
        <Proposer />
      </Suspense>
      <Divider />
      <Suspense fallback={<Skeleton active />}>
        <ProjectDetails project={project.data!} />
      </Suspense>
      {isAdmin && (
        <Suspense fallback={<Skeleton active />}>
          <Divider />
          <AllocateeList />
        </Suspense>
      )}
      {(isStaff || isAdmin) && (
        <Suspense fallback={<Skeleton active />}>
          <Divider />
          <ShortlisterList />
        </Suspense>
      )}
    </>
  );
}

function Proposer() {
  const { id: projectId } = useParams();
  const proposer = useProposer(projectId!);

  // Prefetch user data when hovering over proposer.
  const prefetchUser = usePrefetchUser();

  return (
    <>
      <Title level={4}>Proposer</Title>
      <Paragraph>
        <Link to={`/users/${proposer.data!.id}`} onMouseOver={() => prefetchUser(proposer.data!.id)}>
          {proposer.data!.name} ({proposer.data!.email})
        </Link>
      </Paragraph>
    </>
  );
}

function AllocateeList() {
  const { id: projectId } = useParams();
  const { messageSuccess, messageError } = useMessage();

  const allocatees = useAllocatees(projectId!);
  const nonAllocatees = useNonAllocatees();
  const addAllocatees = useAddAllocatees(projectId!);
  const removeAllocatee = useRemoveAllocatee(projectId!);

  return (
    <>
      <Title level={4}>Allocated Students</Title>
      <Paragraph className="text-slate-500">
        List of students allocated by the administrator will be shown here.
      </Paragraph>
      <EditableUserList
        selectedUsers={allocatees.data!}
        selectableUsers={nonAllocatees.data!}
        children={(allocatee) => {
          return allocatee.allocation?.accepted === null
            ? "No Response"
            : allocatee.allocation?.accepted
              ? "Accepted"
              : "Declined";
        }}
        onAdd={(extraAllocatees) => {
          addAllocatees.mutate(extraAllocatees, {
            onSuccess: () => messageSuccess("Successfully allocated students"),
            onError: () => messageError("Failed to allocate students"),
          });
        }}
        onDelete={(allocatee) => {
          removeAllocatee.mutate(allocatee.id, {
            onSuccess: () => messageSuccess("Successfully removed allocated student"),
            onError: () => messageError("Failed to remove allocated student"),
          });
        }}
      />
    </>
  );
}

function ShortlisterList() {
  const { id } = useParams();
  const shortlisters = useShortlisters(id!);

  return (
    <>
      <Title level={4}>Shortlisted Students</Title>
      <Paragraph className="text-slate-500">
        List of students who shortlisted this projected will be shown in here, in the order of their preference.
      </Paragraph>
      <UserList users={shortlisters.data!} />
    </>
  );
}
