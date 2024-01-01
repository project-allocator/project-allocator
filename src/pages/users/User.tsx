import UserEditDeleteButtons from "@/components/users/UserEditDeleteButtons";
import { useAuth, useUser } from "@/hooks/users";
import { toCapitalCase } from "@/utils";
import { Divider, Space, Typography } from "antd";
import { useParams } from "react-router-dom";

const { Title, Paragraph } = Typography;

export default function User() {
  const { isAdmin } = useAuth();

  const { id: userId } = useParams();
  const user = useUser(userId!);

  return (
    <>
      <Space className="flex items-center justify-between my-8">
        <Title level={3} className="my-0">
          User Profile
        </Title>
        {isAdmin && <UserEditDeleteButtons />}
      </Space>
      <Divider />
      <Title level={4}>Name</Title>
      <Paragraph className="text-slate-500">
        Full name of the user, which is based on the user's profile on Microsoft.
      </Paragraph>
      <Paragraph>{user.data.name}</Paragraph>
      <Title level={4}>Email Address</Title>
      <Paragraph className="text-slate-500">
        Email address of the user, which is based on the user's profile on Microsoft.
      </Paragraph>
      <Paragraph>{user.data.email}</Paragraph>
      <Title level={4}>Role</Title>
      <Paragraph className="text-slate-500">Role of the user. This will be one of student, staff or admin.</Paragraph>
      <Paragraph>{toCapitalCase(user.data.role)}</Paragraph>
    </>
  );
}
