import { AdminService, AllocationService, ProjectRead, ProposalService, UserRead, UserService } from "@/api";
import { ProjectsTable } from "@/components/ProjectTable";
import { useMessageContext } from "@/contexts/MessageContext";
import { getInitialLetters } from "@/utils";
import { CheckOutlined, CloseOutlined, DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import { Avatar, Button, Divider, Input, List, Modal, Select, Space, Switch, Typography, Upload, UploadFile } from "antd";
import { RcFile } from "antd/es/upload";
import { useState } from "react";
import { Link, useLoaderData } from "react-router-dom";

const { Search } = Input;
const { Title, Paragraph } = Typography;

export async function adminLoader() {
  const areProposalsShutdown = await AdminService.areProposalsShutdown();
  const areShortlistsShutdown = await AdminService.areShortlistsShutdown();
  const areUndosShutdown = await AdminService.areUndosShutdown();
  const nonApprovedProjects = await ProposalService.readNonApproved();
  const conflictingProjects = await AllocationService.readConflicting();
  const users = await UserService.readUsers();
  return [areProposalsShutdown, areShortlistsShutdown, areUndosShutdown, nonApprovedProjects, conflictingProjects, users];
}

export default function Admin() {
  const [areProposalsShutdown, areShortlistsShutdown, areUndosShutdown, nonApprovedProjects, conflictingProjects, users]
    = useLoaderData() as [boolean, boolean, boolean, ProjectRead[], ProjectRead[], UserRead[]];
  const [exportType, setExportType] = useState<string>("json");
  const [searchText, setSearchText] = useState<string>('');
  const [allocateProjectsLoading, setAllocateProjectsLoading] = useState<boolean>(false);
  const [deallocateProjectsLoading, setDeallocateProjectsLoading] = useState<boolean>(false);
  const [checkMissingUsersFiles, setCheckMissingUsersFiles] = useState<UploadFile[]>([]);
  const [checkMissingUsersLoading, setCheckMissingUsersLoading] = useState<boolean>(false);
  const [missingEmails, setMissingEmails] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [importFiles, setImportFiles] = useState<UploadFile[]>([]);
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
            .then(() => messageSuccess("Successfully reopened proposals."))
            .catch(() => messageError("Failed to reopen proposals."))
          : AdminService.setProposalsShutdown()
            .then(() => messageSuccess("Successfully shutdown proposals."))
            .catch(() => messageError("Failed to shutdown proposals."))}
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
            .catch(() => messageError("Failed to reopen shortlists."))
          : AdminService.setShortlistsShutdown()
            .then(() => messageSuccess("Successfully shutdown shortlists."))
            .catch(() => messageError("Failed to shutdown shortlists."))}
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
            .catch(() => messageError("Failed to reopen undos."))
          : AdminService.setUndosShutdown()
            .then(() => messageSuccess("Successfully shutdown undos."))
            .catch(() => messageError("Failed to shutdown undos."))}
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
            .catch(() => messageError("Failed to allocate projects."));
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
            .catch(() => messageError("Failed to deallocate projects."));
          setDeallocateProjectsLoading(false);
        }}
      >
        Deallocate
      </Button>
      <Divider />
      <Title level={4}>Import Data</Title>
      <Paragraph className="text-slate-500">
        Import data from the JSON format.
      </Paragraph>
      <Paragraph className="text-slate-500">
        The format of the JSON file should be exactly identical to the file exported by the section below.
      </Paragraph>
      <Space direction="vertical">
        <Upload
          maxCount={1}
          fileList={importFiles}
          onRemove={() => {
            setImportFiles([]);
          }}
          beforeUpload={(file) => {
            setImportFiles([file]);
            // Prevent triggering upload.
            return false;
          }}
        >
          <Button icon={<UploadOutlined />}>Select File</Button>
        </Upload>
        <Button
          icon={<CheckOutlined />}
          loading={checkMissingUsersLoading}
          disabled={checkMissingUsersFiles.length === 0}
          onClick={() => {
            setCheckMissingUsersLoading(true);
            const reader = new FileReader();
            // reader.onload = async (event) => {
            //   const content = event.target?.result as string;
            //   // TODO: Handle import data
            // }
            reader.readAsText(checkMissingUsersFiles[0] as RcFile);
          }}
        >
          Check
        </Button>
      </Space>
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
          Download File
        </Button>
      </Space>
      <Divider />
      <Title level={4}>Check Missing Users</Title>
      <Paragraph className="text-slate-500">
        Check if all users have signed up with this project allocator.
      </Paragraph>
      <Paragraph className="text-slate-500">
        You can upload a CSV file with the list of all users' emails within your department.
      </Paragraph>
      <Space direction="vertical">
        <Upload
          maxCount={1}
          fileList={checkMissingUsersFiles}
          onRemove={() => {
            setCheckMissingUsersFiles([]);
          }}
          beforeUpload={(file) => {
            setCheckMissingUsersFiles([file]);
            // Prevent triggering upload.
            return false;
          }}
        >
          <Button icon={<UploadOutlined />}>Select File</Button>
        </Upload>
        <Button
          icon={<CheckOutlined />}
          loading={checkMissingUsersLoading}
          disabled={checkMissingUsersFiles.length === 0}
          onClick={() => {
            setCheckMissingUsersLoading(true);
            const reader = new FileReader();
            reader.onload = async (event) => {
              const content = event.target?.result as string;
              const allEmails = content.split(',').map((email) => email.trim());
              const missingEmails = await AdminService.checkMissingUsers(allEmails);
              setMissingEmails(missingEmails);
              setIsModalOpen(true);
              setCheckMissingUsersLoading(false);
            }
            reader.readAsText(checkMissingUsersFiles[0] as RcFile);
          }}
        >
          Check
        </Button>
      </Space>
      <Modal
        title={missingEmails.length > 0
          ? "The following users are missing."
          : "No users are missing!"}
        open={isModalOpen}
        footer={<Button type="primary" onClick={() => setIsModalOpen(false)}>OK</Button>}
        onCancel={() => setIsModalOpen(false)}
      >
        {missingEmails.length > 0
          ? (
            <ul className="pl-4 mb-0">
              {missingEmails?.map((email) => <li>{email}</li>)}
            </ul>
          ) : "You can close this window now."}
      </Modal>
      <Divider />
      <Title level={4}>Manage Users</Title>
      <Paragraph className="text-slate-500">
        Search for users and click on the link to view, edit and delete them.
      </Paragraph>
      <Search
        className="w-64 mb-4"
        placeholder="Enter search text"
        onChange={(event) => setSearchText(event.target.value)}
        onSearch={(searchText) => setSearchText(searchText)}
      />
      <List
        itemLayout="horizontal"
        pagination={users.length > 0 && { position: "bottom" }}
        dataSource={users.filter((user) => [
          user.name,
          user.email,
          user.role,
        ].some((text) => text.toLowerCase().includes(searchText.toLowerCase())))}
        renderItem={(user) => (
          <List.Item>
            <List.Item.Meta
              avatar={<Avatar>{getInitialLetters(user.name)}</Avatar>}
              title={<Link to={`/users/${user.id}`}>{user.name}</Link>}
              description={user.email}
            />
          </List.Item>
        )}
      />
      <Divider />
      <Title level={4}>Non-Approved Projects</Title>
      <Paragraph className="text-slate-500">
        Projects that have not been rejected or not yet approved by administrators will be shown here.
      </Paragraph>
      <ProjectsTable projects={nonApprovedProjects} />
      <Divider />
      <Title level={4}>Conflicting Projects</Title>
      <Paragraph className="text-slate-500">
        Projects with students who have not accepted or declined their allocation will be shown here.
      </Paragraph>
      <ProjectsTable projects={conflictingProjects} />
    </>
  );
}
