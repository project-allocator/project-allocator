import { useMessage } from "@/contexts/MessageContext";
import {
  useAllocateProjects,
  useDeallocateProjects,
  useLockAllocations,
  useUnlockAllocations,
} from "@/hooks/allocations";
import { useConfig, useUpdateConfig } from "@/hooks/configs";
import Await from "@/pages/Await";
import { CheckOutlined, CloseOutlined, LockOutlined, UnlockOutlined } from "@ant-design/icons";
import { Button, Divider, Switch, Typography } from "antd";
import { useState } from "react";

const { Title, Paragraph } = Typography;

export default function ManageAllocations() {
  const { messageSuccess, messageError } = useMessage();

  const proposalsShutdown = useConfig("proposals_shutdown");
  const shortlistsShutdown = useConfig("shortlists_shutdown");
  const updateProposalsShutdown = useUpdateConfig("proposals_shutdown");
  const updateShortlistsShutdown = useUpdateConfig("shortlists_shutdown");

  const lockAllocations = useLockAllocations();
  const unlockAllocations = useUnlockAllocations();
  const allocateProjects = useAllocateProjects();
  const deallocateProjects = useDeallocateProjects();

  const [lockAllocationsLoading, setLockAllocationsLoading] = useState<boolean>(false);
  const [unlockAllocationsLoading, setUnlockAllocationsLoading] = useState<boolean>(false);
  const [allocateProjectsLoading, setAllocateProjectsLoading] = useState<boolean>(false);
  const [deallocateProjectsLoading, setDeallocateProjectsLoading] = useState<boolean>(false);

  return (
    <>
      <Title level={3}>Manage Allocations</Title>
      <Divider />
      <Title level={4}>Shutdown Proposals</Title>
      <Paragraph className="text-slate-500">Turn this on to block any new project proposals from staff.</Paragraph>
      <Await query={proposalsShutdown} errorElement="Failed to load proposals shutdown status">
        {(proposalsShutdown) => (
          <Switch
            defaultChecked={proposalsShutdown.value}
            onChange={() =>
              updateProposalsShutdown.mutate(!proposalsShutdown.value, {
                onSuccess: () => messageSuccess("Successfully updated proposals shutdown status"),
                onError: () => messageError("Failed to update proposals shutdown status"),
              })
            }
          />
        )}
      </Await>
      <Title level={4}>Shutdown Shortlists</Title>
      <Paragraph className="text-slate-500">Turn this on to block any new project shortlists from students.</Paragraph>
      <Await query={shortlistsShutdown} errorElement="Failed to load shortlists shutdown status">
        {(shortlistsShutdown) => (
          <Switch
            defaultChecked={shortlistsShutdown.value}
            onChange={() =>
              updateShortlistsShutdown.mutate(!shortlistsShutdown.value, {
                onSuccess: () => messageSuccess("Successfully updated shortlists shutdown status"),
                onError: () => messageError("Failed to update shortlists shutdown status"),
              })
            }
          />
        )}
      </Await>
      <Divider />
      <Title level={4}>Lock Allocations</Title>
      <Paragraph className="text-slate-500">
        Click this to lock all project allocations so that students can no longer accept/reject their allocation or make
        any changes.
      </Paragraph>
      <Button
        icon={<LockOutlined />}
        loading={lockAllocationsLoading}
        onClick={() => {
          setLockAllocationsLoading(true);
          lockAllocations.mutate(undefined, {
            onSuccess: () => messageSuccess("Successfully locked allocations."),
            onError: () => messageError("Failed to lock allocations."),
            onSettled: () => setLockAllocationsLoading(false),
          });
        }}
      >
        Lock
      </Button>
      <Title level={4}>Unlock Allocations</Title>
      <Paragraph className="text-slate-500">
        Click this to unlock all project allocations so that all students can accept/reject their allocation or make
        some changes.
      </Paragraph>
      <Button
        icon={<UnlockOutlined />}
        loading={unlockAllocationsLoading}
        onClick={() => {
          setUnlockAllocationsLoading(true);
          unlockAllocations.mutate(undefined, {
            onSuccess: () => messageSuccess("Successfully unlocked allocations."),
            onError: () => messageError("Failed to unlock allocations."),
            onSettled: () => setUnlockAllocationsLoading(false),
          });
        }}
      >
        Unlock
      </Button>
      <Divider />
      <Title level={4}>Allocate Projects</Title>
      <Paragraph className="text-slate-500">Click this to allocate projects to shortlisted students.</Paragraph>
      <Button
        icon={<CheckOutlined />}
        loading={allocateProjectsLoading}
        onClick={() => {
          setAllocateProjectsLoading(true);
          allocateProjects.mutate(undefined, {
            onSuccess: () => messageSuccess("Successfully allocated projects."),
            onError: () => messageError("Failed to allocate projects."),
            onSettled: () => setAllocateProjectsLoading(false),
          });
        }}
      >
        Allocate
      </Button>
      <Title level={4}>Deallocate Projects</Title>
      <Paragraph className="text-slate-500">Click this to deallocate projects from allocated students.</Paragraph>
      <Button
        icon={<CloseOutlined />}
        loading={deallocateProjectsLoading}
        onClick={() => {
          setDeallocateProjectsLoading(true);
          deallocateProjects.mutate(undefined, {
            onSuccess: () => messageSuccess("Successfully deallocated projects."),
            onError: () => messageError("Failed to deallocate projects."),
            onSettled: () => setDeallocateProjectsLoading(false),
          });
        }}
      >
        Deallocate
      </Button>
    </>
  );
}
