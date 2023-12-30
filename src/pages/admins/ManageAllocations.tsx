import { useMessage } from "@/contexts/MessageContext";
import { useAllocateProjects, useDeallocateProjects } from "@/hooks/allocations";
import { useConfig, useUpdateConfig } from "@/hooks/configs";
import Loading from "@/pages/Loading";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { Button, Divider, Switch, Typography } from "antd";
import { useState } from "react";

const { Title, Paragraph } = Typography;

export default function ManageAllocations() {
  const { messageSuccess, messageError } = useMessage();

  const proposalsShutdown = useConfig("proposals_shutdown");
  const shortlistsShutdown = useConfig("shortlists_shutdown");
  const resetsShutdown = useConfig("resets_shutdown");

  const updateProposalsShutdown = useUpdateConfig("proposals_shutdown");
  const updateShortlistsShutdown = useUpdateConfig("shortlists_shutdown");
  const updateResetsShutdown = useUpdateConfig("resets_shutdown");

  const allocateProjects = useAllocateProjects();
  const deallocateProjects = useDeallocateProjects();
  const [allocateProjectsLoading, setAllocateProjectsLoading] = useState<boolean>(false);
  const [deallocateProjectsLoading, setDeallocateProjectsLoading] = useState<boolean>(false);

  if (proposalsShutdown.isLoading || shortlistsShutdown.isLoading || resetsShutdown.isLoading) return <Loading />;
  if (proposalsShutdown.isError || shortlistsShutdown.isError || resetsShutdown.isError) return null;

  return (
    <>
      {/* TODO: Support shortlist buttons etc */}
      <Title level={3}>Manage Allocations</Title>
      <Divider />
      <Title level={4}>Shutdown Proposals</Title>
      <Paragraph className="text-slate-500">Turn this on to block any new project proposals from staff.</Paragraph>
      <Switch
        defaultChecked={proposalsShutdown.data?.value}
        onChange={() =>
          updateProposalsShutdown.mutate(!proposalsShutdown.data?.value, {
            onSuccess: () => messageSuccess("Successfully updated proposals shutdown status"),
            onError: () => messageError("Failed to update proposals shutdown status"),
          })
        }
      />
      <Title level={4}>Shutdown Shortlists</Title>
      <Paragraph className="text-slate-500">Turn this on to block any new project shortlists from students.</Paragraph>
      <Switch
        defaultChecked={shortlistsShutdown.data?.value}
        onChange={() =>
          updateShortlistsShutdown.mutate(!shortlistsShutdown.data?.value, {
            onSuccess: () => messageSuccess("Successfully updated shortlists shutdown status"),
            onError: () => messageError("Failed to update shortlists shutdown status"),
          })
        }
      />
      <Title level={4}>Shutdown Resets</Title>
      <Paragraph className="text-slate-500">
        Turn this on to block students from resetting "Accept" or "Decline" to their project allocation.
      </Paragraph>
      <Switch
        defaultChecked={resetsShutdown.data?.value}
        onChange={() =>
          updateResetsShutdown.mutate(!resetsShutdown.data?.value, {
            onSuccess: () => messageSuccess("Successfully updated resets shutdown status"),
            onError: () => messageError("Failed to update resets shutdown status"),
          })
        }
      />
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
