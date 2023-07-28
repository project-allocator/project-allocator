import { AdminService, AllocationService, ProjectRead } from "@/api";
import { ProjectsTable } from "@/components/ProjectTable";
import { useMessageContext } from "@/contexts/MessageContext";
import { Button, Divider, Switch, Typography } from "antd";
import { useLoaderData } from "react-router-dom";

const { Title, Paragraph } = Typography;

export async function adminLoader() {
  const areProposalsShutdown = await AdminService.areProposalsShutdown();
  const areShortlistsShutdown = await AdminService.areShortlistsShutdown();
  const conflicted = await AllocationService.readConflicted();
  return [areProposalsShutdown, areShortlistsShutdown, conflicted];
}

export default function Admin() {
  const [areProposalsShutdown, areShortlistsShutdown, conflicted]
    = useLoaderData() as [boolean, boolean, ProjectRead[]];
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
      <Title level={4}>Conflicting Projects</Title>
      <Paragraph className="text-slate-500">
        Projects with students who have not accepted or declined their allocation will be shown here.
      </Paragraph>
      <ProjectsTable projects={conflicted} />
    </>
  );
}
