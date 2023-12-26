import { AllocationService, ConfigService } from "@/api";
import { useConfig } from "@/contexts/ConfigContext";
import { useMessage } from "@/contexts/MessageContext";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { Button, Divider, Switch, Typography } from "antd";
import { useState } from "react";

const { Title, Paragraph } = Typography;

export default function ManageAllocations() {
  const [allocateProjectsLoading, setAllocateProjectsLoading] = useState<boolean>(false);
  const [deallocateProjectsLoading, setDeallocateProjectsLoading] = useState<boolean>(false);
  const { messageSuccess, messageError } = useMessage();

  const proposalsShutdown = useConfig("proposals_shutdown");
  const shortlistsShutdown = useConfig("shortlists_shutdown");
  const resetsShutdown = useConfig("resets_shutdown");

  return (
    <>
      <Title level={3}>Manage Allocations</Title>
      <Divider />
      <Title level={4}>Shutdown Proposals</Title>
      <Paragraph className="text-slate-500">Turn this on to block any new project proposasl from staff.</Paragraph>
      <Switch
        defaultChecked={proposalsShutdown}
        onChange={() =>
          proposalsShutdown
            ? ConfigService.updateConfig("proposals_shutdown", false) // TODO: Update state/cache after migrating to React Query
                .then(() => messageSuccess("Successfully reopened proposals."))
                .catch(messageError)
            : ConfigService.updateConfig("proposals_shutdown", true)
                .then(() => messageSuccess("Successfully shutdown proposals."))
                .catch(messageError)
        }
      />
      <Title level={4}>Shutdown Shortlists</Title>
      <Paragraph className="text-slate-500">Turn this on to block any new project shortlists from students.</Paragraph>
      <Switch
        defaultChecked={shortlistsShutdown}
        onChange={() =>
          shortlistsShutdown
            ? ConfigService.updateConfig("shortlists_shutdown", false)
                .then(() => messageSuccess("Successfully reopened shortlists."))
                .catch(messageError)
            : ConfigService.updateConfig("shortlists_shutdown", true)
                .then(() => messageSuccess("Successfully shutdown shortlists."))
                .catch(messageError)
        }
      />
      <Title level={4}>Shutdown Resets</Title>
      <Paragraph className="text-slate-500">
        Turn this on to block students from resetting "Accept" or "Decline" to their project allocation.
      </Paragraph>
      <Switch
        defaultChecked={resetsShutdown}
        onChange={() =>
          resetsShutdown
            ? ConfigService.updateConfig("resets_shutdown", false)
                .then(() => messageSuccess("Successfully reopened resets."))
                .catch(messageError)
            : ConfigService.updateConfig("resets_shutdown", true)
                .then(() => messageSuccess("Successfully shutdown resets."))
                .catch(messageError)
        }
      />
      <Divider />
      <Title level={4}>Allocate Projects</Title>
      <Paragraph className="text-slate-500">Click this to allocate projects to shortlisted students.</Paragraph>
      <Button
        icon={<CheckOutlined />}
        loading={allocateProjectsLoading}
        onClick={async () => {
          setAllocateProjectsLoading(true);
          await AllocationService.allocateProjects()
            .then(() => messageSuccess("Successfully allocated projects."))
            .catch(messageError);
          setAllocateProjectsLoading(false);
        }}
      >
        Allocate
      </Button>
      <Title level={4}>Deallocate Projects</Title>
      <Paragraph className="text-slate-500">Click this to deallocate projects from allocated students.</Paragraph>
      <Button
        icon={<CloseOutlined />}
        loading={deallocateProjectsLoading}
        onClick={async () => {
          setDeallocateProjectsLoading(true);
          await AllocationService.deallocateProjects()
            .then(() => messageSuccess("Successfully deallocated projects."))
            .catch(messageError);
          setDeallocateProjectsLoading(false);
        }}
      >
        Deallocate
      </Button>
    </>
  );
}
