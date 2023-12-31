import UserEditDeleteButtons from "@/components/users/UserEditDeleteButtons";
import { useCurrentUserRole, useUser } from "@/hooks/users";
import Await from "@/pages/Await";
import { toCapitalCase } from "@/utils";
import { Divider, Space, Typography } from "antd";
import { useParams } from "react-router-dom";

const { Title, Paragraph } = Typography;

export default function User() {
  const { id: userId } = useParams();
  const user = useUser(userId!);

  const { isAdmin } = useCurrentUserRole();

  return (
    <>
      <Space className="flex items-end justify-between">
        <Title level={3} className="mb-0">
          User Profile
        </Title>
        {isAdmin && <UserEditDeleteButtons />}
      </Space>
      <Divider />
      <Await query={user} errorElement="Failed to load user">
        {(user) => (
          <>
            <Title level={4}>Name</Title>
            <Paragraph className="text-slate-500">
              Full name of the user, which is based on the user's profile on Microsoft.
            </Paragraph>
            <Paragraph>{user.name}</Paragraph>
            <Title level={4}>Email Address</Title>
            <Paragraph className="text-slate-500">
              Email address of the user, which is based on the user's profile on Microsoft.
            </Paragraph>
            <Paragraph>{user.email}</Paragraph>
            <Title level={4}>Role</Title>
            <Paragraph className="text-slate-500">
              Role of the user. This will be one of student, staff or admin.
            </Paragraph>
            <Paragraph>{toCapitalCase(user.role)}</Paragraph>
          </>
        )}
      </Await>
    </>
  );
}
