import { UserRead, readUser } from "@/services/users";
import { toCapitalCase } from "@/utils";
import { UserOutlined } from "@ant-design/icons";
import { Avatar, Divider, Space, Typography } from "antd";
import { LoaderFunction, useLoaderData } from 'react-router-dom';

const { Title, Paragraph } = Typography;

export const loader: LoaderFunction = async ({ params }) => {
  const { data } = await readUser(parseInt(params.id!));
  return data
}

export default function User() {
  const user = useLoaderData() as UserRead;

  return (
    <>
      <Title level={3}>Profile</Title>
      <Divider />
      <Title level={4}>Name</Title>
      <Paragraph>{user.name}</Paragraph>
      <Title level={4}>Email Address</Title>
      <Paragraph>{user.email}</Paragraph>
      <Title level={4}>Role</Title>
      <Paragraph>{toCapitalCase(user.role)}</Paragraph>
      <Space wrap size={16}>
        <Avatar shape="square" size={64} icon={<UserOutlined />} />
      </Space>
    </>
  );
}
