import { UserOutlined } from "@ant-design/icons";
import { Avatar, Divider, Space, Typography } from "antd";
const { Title, Paragraph } = Typography;

export default function User() {
  return (
    <>
      <Title level={3}>Profile</Title>
      <Divider />
      <Title level={4}>Name</Title>
      <Paragraph>Sheldon Cooper</Paragraph>
      <Title level={4}>Email Address</Title>
      <Paragraph>scooper@caltech.com</Paragraph>
      <Title level={4}>Role</Title>
      <Paragraph>Staff/Student</Paragraph>
      <Space wrap size={16}>
        <Avatar shape="square" size={64} icon={<UserOutlined />} />
      </Space>
    </>
  );
}
