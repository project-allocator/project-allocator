import { AdminService, UserRead, UserService } from "@/api";
import { getInitialLetters } from "@/utils";
import { CheckOutlined, UploadOutlined } from '@ant-design/icons';
import { Avatar, Button, Divider, Input, List, Modal, Space, Typography, Upload, UploadFile } from "antd";
import { RcFile } from "antd/es/upload";
import { useState } from "react";
import { Link, useLoaderData } from "react-router-dom";

const { Search } = Input;
const { Title, Paragraph } = Typography;

export async function manageUsersLoader() {
  const users = await UserService.readUsers();
  return [users];
}

export default function ManageUsers() {
  const [users] = useLoaderData() as [UserRead[]];
  const [searchText, setSearchText] = useState<string>('');
  const [checkMissingUsersFiles, setCheckMissingUsersFiles] = useState<UploadFile[]>([]);
  const [checkMissingUsersLoading, setCheckMissingUsersLoading] = useState<boolean>(false);
  const [missingEmails, setMissingEmails] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  return (
    <>
      <Title level={3}>
        Administration
      </Title>
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
    </>
  );
}
