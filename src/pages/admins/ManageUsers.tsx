import { AdminService } from "@/api";
import UserList from "@/components/users/UserList";
import { useUnallocatedUsers } from "@/hooks/admins";
import { useUsers } from "@/hooks/users";
import Loading from "@/pages/Loading";
import { CheckOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Divider, Modal, Space, Typography, Upload, UploadFile } from "antd";
import { RcFile } from "antd/es/upload";
import { useState } from "react";

const { Title, Paragraph } = Typography;

export default function ManageUsers() {
  const allUsers = useUsers();
  const unallocatedUsers = useUnallocatedUsers();

  const [checkMissingUsersFiles, setCheckMissingUsersFiles] = useState<UploadFile[]>([]);
  const [checkMissingUsersLoading, setCheckMissingUsersLoading] = useState<boolean>(false);
  const [missingEmails, setMissingEmails] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  if (allUsers.isLoading || unallocatedUsers.isLoading) return <Loading />;
  if (allUsers.isError || unallocatedUsers.isError) return null;

  return (
    <>
      <Title level={3}>Manage Users</Title>
      <Divider />
      <Title level={4}>Check Missing Users</Title>
      <Paragraph className="text-slate-500">Check if all users have signed up with this project allocator.</Paragraph>
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
              const allEmails = content.split(",").map((email) => email.trim());
              const missingEmails = await AdminService.checkMissingUsers(allEmails);
              setMissingEmails(missingEmails);
              setIsModalOpen(true);
              setCheckMissingUsersLoading(false);
            };
            reader.readAsText(checkMissingUsersFiles[0] as RcFile);
          }}
        >
          Check
        </Button>
      </Space>
      <Modal
        title={missingEmails.length > 0 ? "The following users are missing." : "No users are missing!"}
        open={isModalOpen}
        footer={
          <Button type="primary" onClick={() => setIsModalOpen(false)}>
            OK
          </Button>
        }
        onCancel={() => setIsModalOpen(false)}
      >
        {missingEmails.length > 0 ? (
          <ul className="pl-4 mb-0">{missingEmails?.map((email) => <li>{email}</li>)}</ul>
        ) : (
          "You can close this window now."
        )}
      </Modal>
      <Divider />
      <Title level={4}>Unallocated Users</Title>
      <Paragraph className="text-slate-500">
        Users who have not been allocated to any project will be shown here.
      </Paragraph>
      <UserList users={unallocatedUsers.data!} />
      <Divider />
      <Title level={4}>Manage Users</Title>
      <Paragraph className="text-slate-500">
        Search for users and click on the link to view, edit and delete them.
      </Paragraph>
      <UserList users={allUsers.data!} />
    </>
  );
}
