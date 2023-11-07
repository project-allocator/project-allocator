import { AdminService, AllocationService } from "@/api";
import { useMessage } from "@/contexts/MessageContext";
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Button, Divider, Switch, Typography } from "antd";
import { useState } from "react";
import { useLoaderData } from "react-router-dom";

const { Title, Paragraph } = Typography;

export async function manageAllocationsLoader() {
  const areProposalsShutdown = await AdminService.areProposalsShutdown();
  const areShortlistsShutdown = await AdminService.areShortlistsShutdown();
  const areUndosShutdown = await AdminService.areUndosShutdown();
  return [areProposalsShutdown, areShortlistsShutdown, areUndosShutdown];
}

export default function ManageAllocations() {
  const [areProposalsShutdown, areShortlistsShutdown, areUndosShutdown]
    = useLoaderData() as [boolean, boolean, boolean];
  const [allocateProjectsLoading, setAllocateProjectsLoading] = useState<boolean>(false);
  const [deallocateProjectsLoading, setDeallocateProjectsLoading] = useState<boolean>(false);
  const { messageSuccess, messageError } = useMessage();

  return (
    <>
      <Title level={3}>
        Manage Allocations
      </Title>
      <Divider />
      <Title level={4}>Shutdown Proposals</Title>
      <Paragraph className="text-slate-500">
        Turn this on to block any new project proposasl from staff.
      </Paragraph>
      <Switch
        defaultChecked={areProposalsShutdown}
        onChange={() => areProposalsShutdown
          ? AdminService.unsetProposalsShutdown()
            .then(() => messageSuccess("Successfully reopened proposals."))
            .catch(messageError)
          : AdminService.setProposalsShutdown()
            .then(() => messageSuccess("Successfully shutdown proposals."))
            .catch(messageError)}
      />
      <Title level={4}>Shutdown Shortlists</Title>
      <Paragraph className="text-slate-500">
        Turn this on to block any new project shortlists from students.
      </Paragraph>
      <Switch
        defaultChecked={areShortlistsShutdown}
        onChange={() => areShortlistsShutdown
          ? AdminService.unsetShortlistsShutdown()
            .then(() => messageSuccess("Successfully reopened shortlists."))
            .catch(messageError)
          : AdminService.setShortlistsShutdown()
            .then(() => messageSuccess("Successfully shutdown shortlists."))
            .catch(messageError)}
      />
      <Title level={4}>Shutdown Undos</Title>
      <Paragraph className="text-slate-500">
        Turn this on to block students from undo-ing "Accept" or "Decline" to their project allocation.
      </Paragraph>
      <Switch
        defaultChecked={areUndosShutdown}
        onChange={() => areUndosShutdown
          ? AdminService.unsetUndosShutdown()
            .then(() => messageSuccess("Successfully reopened undos."))
            .catch(messageError)
          : AdminService.setUndosShutdown()
            .then(() => messageSuccess("Successfully shutdown undos."))
            .catch(messageError)}
      />
      <Divider />
      <Title level={4}>Allocate Projects</Title>
      <Paragraph className="text-slate-500">
        Click this to allocate projects to shortlisted students.
      </Paragraph>
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
      </Button >
      <Title level={4}>Deallocate Projects</Title>
      <Paragraph className="text-slate-500">
        Click this to deallocate projects from allocated students.
      </Paragraph>
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
