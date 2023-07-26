import { loginRequest } from '@/auth';
import { WindowsOutlined } from '@ant-design/icons';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { Button, Layout, Space, Typography } from "antd";
import axios from 'axios';

const { Title, Paragraph } = Typography;

export default function SignIn() {
  const isAuth = useIsAuthenticated();
  const { instance } = useMsal();
  if (isAuth)
    instance.acquireTokenSilent({
      ...loginRequest,
      account: instance.getAllAccounts()[0],
    }).then(response => {
      axios.get('/api/test', { headers: { 'Authorization': `Bearer ${response.accessToken}` } })
        .then(response => console.log(response))
        .catch(error => console.log(error));
    });

  return (
    <Layout className="grid place-content-center">
      <Space direction="vertical" className="max-w-xl text-center">
        <Title level={3}>Sign In to Project Allocator</Title>
        <Paragraph>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</Paragraph>
        <Button
          type="primary"
          onClick={() => instance.loginPopup(loginRequest)}>
          <Space>
            Sign In with Microsoft SSO
            <WindowsOutlined />
          </Space>
        </Button>
      </Space>
    </Layout>
  );
}