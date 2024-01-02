import { useMessage } from "@/contexts/MessageContext";
import {
  useAllocateProjects,
  useDeallocateProjects,
  useLockAllocations,
  useUnlockAllocations,
} from "@/hooks/allocations";
import { useConfig, useUpdateConfig } from "@/hooks/configs";
import { CheckOutlined, CloseOutlined, LockOutlined, UnlockOutlined } from "@ant-design/icons";
import { Button, Divider, Skeleton, Switch, Typography } from "antd";
import { Suspense, useState } from "react";

const { Title, Paragraph } = Typography;

export default function ManageAllocations() {
  return (
    <>
      <Title level={3}>Manage Allocations</Title>
      <Divider />
      <Suspense fallback={<Skeleton active />}>
        <ShutdownProposals />
      </Suspense>
      <Divider />
      <Suspense fallback={<Skeleton active />}>
        <ShutdownShortlists />
      </Suspense>
      <Divider />
      <LockAllocations />
      <UnlockAllocations />
      <AllocateProjects />
      <DeallocateProjects />
    </>
  );
}

function ShutdownProposals() {
  const { messageSuccess, messageError } = useMessage();

  const proposalsShutdown = useConfig("proposals_shutdown");
  const updateProposalsShutdown = useUpdateConfig("proposals_shutdown");

  return (
    <>
      <Title level={4}>Shutdown Proposals</Title>
      <Paragraph className="text-slate-500">Turn this on to block any new project proposals from staff.</Paragraph>
      <Switch
        defaultChecked={proposalsShutdown.data.value}
        onChange={() =>
          updateProposalsShutdown.mutate(!proposalsShutdown.data.value, {
            onSuccess: () => messageSuccess("Successfully updated proposals shutdown status"),
            onError: () => messageError("Failed to update proposals shutdown status"),
          })
        }
      />
    </>
  );
}

function ShutdownShortlists() {
  const { messageSuccess, messageError } = useMessage();

  const shortlistsShutdown = useConfig("shortlists_shutdown");
  const updateShortlistsShutdown = useUpdateConfig("shortlists_shutdown");

  return (
    <>
      <Title level={4}>Shutdown Shortlists</Title>
      <Paragraph className="text-slate-500">Turn this on to block any new project shortlists from students.</Paragraph>
      <Switch
        defaultChecked={shortlistsShutdown.data.value}
        onChange={() =>
          updateShortlistsShutdown.mutate(!shortlistsShutdown.data.value, {
            onSuccess: () => messageSuccess("Successfully updated shortlists shutdown status"),
            onError: () => messageError("Failed to update shortlists shutdown status"),
          })
        }
      />
    </>
  );
}

function LockAllocations() {
  const { messageSuccess, messageError } = useMessage();

  const lockAllocations = useLockAllocations();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <>
      <Title level={4}>Lock Allocations</Title>
      <Paragraph className="text-slate-500">
        Click this to lock all project allocations so that students can no longer accept/reject their allocation or make
        any changes.
      </Paragraph>
      <Button
        icon={<LockOutlined />}
        loading={isLoading}
        onClick={() => {
          setIsLoading(true);
          lockAllocations.mutate(undefined, {
            onSuccess: () => messageSuccess("Successfully locked allocations."),
            onError: () => messageError("Failed to lock allocations."),
            onSettled: () => setIsLoading(false),
          });
        }}
      >
        Lock
      </Button>
    </>
  );
}

function UnlockAllocations() {
  const { messageSuccess, messageError } = useMessage();

  const unlockAllocations = useUnlockAllocations();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <>
      <Title level={4}>Unlock Allocations</Title>
      <Paragraph className="text-slate-500">
        Click this to unlock all project allocations so that all students can accept/reject their allocation or make
        some changes.
      </Paragraph>
      <Button
        icon={<UnlockOutlined />}
        loading={isLoading}
        onClick={() => {
          setIsLoading(true);
          unlockAllocations.mutate(undefined, {
            onSuccess: () => messageSuccess("Successfully unlocked allocations."),
            onError: () => messageError("Failed to unlock allocations."),
            onSettled: () => setIsLoading(false),
          });
        }}
      >
        Unlock
      </Button>
    </>
  );
}

function AllocateProjects() {
  const { messageSuccess, messageError } = useMessage();

  const allocateProjects = useAllocateProjects();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <>
      <Title level={4}>Allocate Projects</Title>
      <Paragraph className="text-slate-500">Click this to allocate projects to shortlisted students.</Paragraph>
      <Button
        icon={<CheckOutlined />}
        loading={isLoading}
        onClick={() => {
          setIsLoading(true);
          allocateProjects.mutate(undefined, {
            onSuccess: () => messageSuccess("Successfully allocated projects."),
            onError: () => messageError("Failed to allocate projects."),
            onSettled: () => setIsLoading(false),
          });
        }}
      >
        Allocate
      </Button>
    </>
  );
}

function DeallocateProjects() {
  const { messageSuccess, messageError } = useMessage();

  const deallocateProjects = useDeallocateProjects();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <>
      <Title level={4}>Deallocate Projects</Title>
      <Paragraph className="text-slate-500">Click this to deallocate projects from allocated students.</Paragraph>
      <Button
        icon={<CloseOutlined />}
        loading={isLoading}
        onClick={() => {
          setIsLoading(true);
          deallocateProjects.mutate(undefined, {
            onSuccess: () => messageSuccess("Successfully deallocated projects."),
            onError: () => messageError("Failed to deallocate projects."),
            onSettled: () => setIsLoading(false),
          });
        }}
      >
        Deallocate
      </Button>
    </>
  );
}
