import { AdminService, AllocationService, ProjectRead } from "@/api";
import { ProjectsTable } from "@/components/ProjectTable";
import { useMessageContext } from "@/contexts/MessageContext";
import { CheckOutlined, CloseOutlined, DownloadOutlined } from '@ant-design/icons';
import { Button, Divider, Select, Space, Switch, Typography } from "antd";
import { useState } from "react";
import { useLoaderData } from "react-router-dom";

const { Title, Paragraph } = Typography;

export async function adminLoader() {
  const areProposalsShutdown = await AdminService.areProposalsShutdown();
  const areShortlistsShutdown = await AdminService.areShortlistsShutdown();
  const areUndosShutdown = await AdminService.areUndosShutdown();
  const conflicted = await AllocationService.readConflicting();
  return [areProposalsShutdown, areShortlistsShutdown, areUndosShutdown, conflicted];
}

export default function Admin() {
  const [areProposalsShutdown, areShortlistsShutdown, areUndosShutdown, conflicted]
    = useLoaderData() as [boolean, boolean, boolean, ProjectRead[]];
  const [exportType, setExportType] = useState<string>("json")
  const { messageSuccess, messageError } = useMessageContext();

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
      <Title level={4}>Shutdown Undos</Title>
      <Paragraph className="text-slate-500">
        Turn this on to block students from undo-ing "Accept" or "Decline" to their project allocation.
      </Paragraph>
      <Switch
        defaultChecked={areUndosShutdown}
        onChange={() => areUndosShutdown
          ? AdminService.unsetUndosShutdown()
          : AdminService.setUndosShutdown()}
      />
      <Divider />
      <Title level={4}>Allocate Projects</Title>
      <Paragraph className="text-slate-500">
        Click this to allocate projects to shortlisted students.
      </Paragraph>
      <Button
        icon={<CheckOutlined />}
        onClick={() => AllocationService.allocateProjects()
          .then(() => messageSuccess("Successfully allocated projects."))
          .catch(() => messageError("Failed to allocate projects."))}
      >
        Allocate
      </Button >
      <Title level={4}>Deallocate Projects</Title>
      <Paragraph className="text-slate-500">
        Click this to deallocate projects from allocated students.
      </Paragraph>
      <Button
        icon={<CloseOutlined />}
        onClick={() => AllocationService.deallocateProjects()
          .then(() => messageSuccess("Successfully deallocated projects."))
          .catch(() => messageError("Failed to deallocate projects."))}
      >
        Deallocate
      </Button>
      <Divider />
      <Title level={4}>Export Data</Title>
      <Paragraph className="text-slate-500">
        Export data in the JSON or CSV format.
      </Paragraph>
      <Paragraph className="text-slate-500">
        The JSON format exports all information and is suitable for further processing data with Python etc.<br />
        The CSV format exports minimal information about the project and allocation and is ready to be shared with staff and students.
      </Paragraph>
      <Space direction="vertical">
        <Select
          defaultValue="json"
          className="w-20"
          options={[
            { value: 'json', label: 'JSON' },
            { value: 'csv', label: 'CSV' },
          ]}
          onChange={(value) => setExportType(value)}
        />
        <Button
          icon={<DownloadOutlined />}
          onClick={() => {
            (exportType === "json"
              ? AdminService.exportJson()
              : AdminService.exportCsv()
            ).then((response) => {
              // Create blob link to download
              // https://stackoverflow.com/questions/50694881/how-to-download-file-in-react-js
              const url = window.URL.createObjectURL(new Blob([response]));
              const linkElement = document.createElement('a');
              linkElement.href = url;
              linkElement.setAttribute('download', `output.${exportType}`);
              document.body.appendChild(linkElement);
              linkElement.click();
              document.body.removeChild(linkElement);
            });
          }}
        >
          Download
        </Button>
      </Space>
      <Divider />
      <Title level={4}>Conflicting Projects</Title>
      <Paragraph className="text-slate-500">
        Projects with students who have not accepted or declined their allocation will be shown here.
      </Paragraph>
      <ProjectsTable projects={conflicted} />
    </>
  );
}
