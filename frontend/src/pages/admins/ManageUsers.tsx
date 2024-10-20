import { AdminService } from "@/api";
import EditableEmails from "@/components/common/EditableEmails";
import UserList from "@/components/users/UserList";
import { useMessage } from "@/contexts/MessageContext";
import { useNonAllocatees } from "@/hooks/allocations";
import { useConfig, useUpdateConfig } from "@/hooks/configs";
import { useUsers } from "@/hooks/users";
import { CheckOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Divider, Modal, Skeleton, Space, Typography, Upload, UploadFile } from "antd";
import { RcFile } from "antd/es/upload";
import { Suspense, useState } from "react";

const { Title, Paragraph } = Typography;

export default function ManageUsers() {
  return (
    <>
      <Title level={3}>Manage Users</Title>
      <Divider />
      <Suspense fallback={<Skeleton active />}>
        <AdminEmails />
      </Suspense>
      <Divider />
      <MissingUsers />
      <Divider />
      <Suspense fallback={<Skeleton active />}>
        <UnallocatedUsers />
      </Suspense>
      <Divider />
      <Suspense fallback={<Skeleton active />}>
        <AllUsers />
      </Suspense>
    </>
  );
}

function AdminEmails() {
  const { messageSuccess, messageError } = useMessage();
  const updateAdminEmails = useUpdateConfig("admin_emails");
  const initAdminEmails = useConfig("admin_emails");
  const [adminEmails, setAdminEmails] = useState<string[]>(initAdminEmails.data.value);

  return (
    <>
      <Title level={4}>Admin Emails</Title>
      <Paragraph className="text-slate-500">
        Register the emails of default admins for the Project Allocation. Users who sign up with these emails will be
        automatically assigned the admin role.
      </Paragraph>
      <Space direction="vertical" className="w-full">
        <EditableEmails emails={adminEmails} onUpdate={setAdminEmails} />
        <Button
          icon={<CheckOutlined />}
          onClick={() =>
            updateAdminEmails.mutate(adminEmails, {
              onSuccess: () => messageSuccess("Successfully updated admin emails"),
              onError: () => messageError("Failed to update admin emails"),
            })
          }
        >
          Update
        </Button>
      </Space>
    </>
  );
}

function MissingUsers() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [missingEmails, setMissingEmails] = useState<string[]>([]);

  return (
    <>
      <Title level={4}>Missing Users</Title>
      <Paragraph className="text-slate-500">Check if all users have signed up with this project allocator.</Paragraph>
      <Paragraph className="text-slate-500">
        You can upload a CSV file with the list of all users' emails within your department.
      </Paragraph>
      <Space direction="vertical">
        <Upload
          maxCount={1}
          fileList={fileList}
          onRemove={() => {
            setFileList([]);
          }}
          beforeUpload={(file) => {
            setFileList([file]);
            // Prevent triggering upload.
            return false;
          }}
        >
          <Button icon={<UploadOutlined />}>Select File</Button>
        </Upload>
        <Button
          icon={<CheckOutlined />}
          loading={isLoading}
          disabled={fileList.length === 0}
          onClick={() => {
            setIsLoading(true);
            const reader = new FileReader();
            reader.onload = async (event) => {
              const content = event.target?.result as string;
              const allEmails = content.split(",").map((email) => email.trim());
              const missingEmails = await AdminService.checkMissingUsers(allEmails);
              setMissingEmails(missingEmails);
              setIsModalOpen(true);
              setIsLoading(false);
            };
            reader.readAsText(fileList[0] as RcFile);
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
    </>
  );
}

function UnallocatedUsers() {
  const nonAllocatees = useNonAllocatees();

  return (
    <>
      <Title level={4}>Unallocated Users</Title>
      <Paragraph className="text-slate-500">
        Users who have not been allocated to any project will be shown here.
      </Paragraph>
      <UserList users={nonAllocatees.data} />
    </>
  );
}

function AllUsers() {
  const allUsers = useUsers();

  return (
    <>
      <Title level={4}>Check All Users</Title>
      <Paragraph className="text-slate-500">
        Search for users and click on the link to view, edit and delete them.
      </Paragraph>
      <UserList users={allUsers.data} />
    </>
  );
}
