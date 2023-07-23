import { UserRead, UserService } from "@/services/api";
import { getInitialLetters, toCapitalCase } from "@/utils";
import { Avatar, Divider, Typography } from "antd";
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
      <Title level={3} className="flex justify-between items-center">
        Profile
        <Avatar>{getInitialLetters(user.name)}</Avatar>
      </Title>
      <Divider />
      <Title level={4}>Name</Title>
      <Paragraph>{user.name}</Paragraph>
      <Title level={4}>Email Address</Title>
      <Paragraph>{user.email}</Paragraph>
      <Title level={4}>Role</Title>
      <Paragraph>{toCapitalCase(user.role)}</Paragraph>
    </>
  );
}
