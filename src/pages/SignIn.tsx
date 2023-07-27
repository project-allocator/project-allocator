import { UserService } from '@/api';
import { authRequest } from '@/auth';
import { useUserContext } from '@/contexts/UserContext';
import { WindowsOutlined } from '@ant-design/icons';
import { useMsal } from '@azure/msal-react';
import { Button, Card, Layout, Space, Typography } from "antd";
import logo from './logo.svg';

const { Title, Paragraph } = Typography;

export default function SignIn() {
  const { instance: msalInstance } = useMsal();
  const { setUser } = useUserContext();

  return (
    <Layout className="grid place-content-center">
      <Card className="max-w-xl">
        <Space direction="vertical" className='p-8'>
          <img
            src={logo}
            alt="Imperial College London - Logo"
            className="w-64 m-0"
          />
          <Title level={3}>
            Project Allocator
          </Title>
          <Paragraph>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.
          </Paragraph>
          <Button
            type="primary"
            onClick={async () => {
              const { account } = await msalInstance.loginPopup(authRequest);
              msalInstance.setActiveAccount(account);
              const user = await UserService.createUser();
              setUser(user);
            }}>
            <Space>
              Sign In with Microsoft SSO
              <WindowsOutlined />
            </Space>
          </Button>
        </Space>
      </Card>

    </Layout>
  );
}