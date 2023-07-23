import client from "@/services/api";
import type { User } from '@/types';
import { getInitialLetters, toCapitalCase } from "@/utils";
import { Avatar, Divider, Typography } from "antd";
import { LoaderFunctionArgs, useLoaderData } from 'react-router-dom';

const { Title, Paragraph } = Typography;

export async function userLoader({ params }: LoaderFunctionArgs) {
  const { data } = await client.get(`/users/${params.id}`);
  return data;
}

export async function currentUserLoader() {
  const { data } = await client.get('/users/me');
  return data;
}

export default function User() {
  const user = useLoaderData() as User;

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
