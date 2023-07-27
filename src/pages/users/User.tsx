import { UserRead, UserService } from "@/api";
import { getInitialLetters, toCapitalCase } from "@/utils";
import { Avatar, Divider, Space, Typography } from "antd";
import { LoaderFunctionArgs, useLoaderData } from 'react-router-dom';

const { Title, Paragraph } = Typography;

export async function userLoader({ params }: LoaderFunctionArgs) {
  return await UserService.readUser(parseInt(params.id!));
}

export async function currentUserLoader() {
  return await UserService.readCurrentUser();
}

export default function User() {
  const user = useLoaderData() as UserRead;

  return (
    <>
      <Space className="flex items-end justify-between">
        <Title level={3} className="mb-0">
          Profile
        </Title>
        <Avatar>{getInitialLetters(user.name)}</Avatar>
      </Space>
      <Divider />
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
  );
}
