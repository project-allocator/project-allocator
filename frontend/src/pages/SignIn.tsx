import { UserOutlined, WindowsOutlined } from "@ant-design/icons";
import { useMsal } from "@azure/msal-react";
import { Avatar, Button, Card, Layout, Space, Typography } from "antd";

const { Title, Paragraph } = Typography;

export default function SignIn() {
  const { instance: msalInstance } = useMsal();

  return (
    <Layout className="grid place-content-center">
      <Card className="p-4">
        <Space direction="vertical" className="flex items-center">
          <Avatar size={96} icon={<UserOutlined />} />
          <Space direction="vertical" className="text-center">
            <Title level={3}>Project Allocator</Title>
            <Paragraph className="max-w-sm">Project Allocator for Imperial College London</Paragraph>
            <Button type="primary" onClick={() => msalInstance.loginRedirect()}>
              <Space>
                Sign in with Microsoft
                <WindowsOutlined />
              </Space>
            </Button>
          </Space>
        </Space>
      </Card>
    </Layout>
  );
}
