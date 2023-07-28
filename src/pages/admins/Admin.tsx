import { AdminService, AllocationService } from "@/api";
import { useMessageContext } from "@/contexts/MessageContext";
import { Button, Divider, Switch, Typography } from "antd";
import { useLoaderData } from "react-router-dom";

const { Title, Paragraph } = Typography;

export async function adminLoader() {
  const areProposalsShutdown = await AdminService.areProposalsShutdown();
  const areShortlistsShutdown = await AdminService.areShortlistsShutdown();
  return [areProposalsShutdown, areShortlistsShutdown];
}

export default function Admin() {
  const [areProposalsShutdown, areShortlistsShutdown] = useLoaderData() as [boolean, boolean];
  const { messageSuccess } = useMessageContext();

  return (
    <>
      <Title level={3}>
        Administration
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
          : AdminService.setProposalsShutdown()}
      />
      <Title level={4}>Shutdown Shortlists</Title>
      <Paragraph className="text-slate-500">
        Turn this on to block any new project shortlists from students.
      </Paragraph>
      <Switch
        defaultChecked={areShortlistsShutdown}
        onChange={() => areShortlistsShutdown
          ? AdminService.unsetShortlistsShutdown()
          : AdminService.setShortlistsShutdown()}
      />
      <Divider />
      <Title level={4}>Allocate Projects</Title>
      <Paragraph className="text-slate-500">
        Click this to allocate projects to shortlisted students.
      </Paragraph>
      <Button onClick={async () => {
        await AllocationService.allocateProjects();
        messageSuccess("Successfully allocated projects to all students.");
      }}>
        Allocate
      </Button>
      <Title level={4}>Deallocate Projects</Title>
      <Paragraph className="text-slate-500">
        Click this to deallocate projects from allocated students.
      </Paragraph>
      <Button onClick={async () => {
        await AllocationService.deallocateProjects();
        messageSuccess("Successfully deallocated projects from all students.");
      }}>
        Deallocate
      </Button>
    </>
  );
}
