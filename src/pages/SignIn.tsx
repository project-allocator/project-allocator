import { WindowsOutlined } from '@ant-design/icons';
import { Button, Card, Layout, Space, Typography } from "antd";

const { Title, Paragraph } = Typography;

export default function SignIn() {
  return (
    <Layout className="grid place-content-center">
      <Card bordered={true} className="max-w-xl p-6">
        <Space direction="vertical" align="center">
          <Title level={3}>Sign In to Project Allocator</Title>
          <Paragraph>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</Paragraph>
          <Button
            type="primary"
            href="/api/auth/signin"
            onClick={(event) => {
              event.preventDefault();
              // TODO: Setup Microsoft SSO
              // signIn();
            }}>
            <Space>
              Sign In with SSO
              <WindowsOutlined />
            </Space>
          </Button>
        </Space>
      </Card>
    </Layout>
  );
}