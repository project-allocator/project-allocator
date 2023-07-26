import { useUserContext } from "@/contexts/UserContext";
import AuthRoute from "@/routes/AuthRoute";
import { DownOutlined, LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { useMsal } from "@azure/msal-react";
import { Button, Dropdown, Layout, Space } from "antd";
import { Link } from "react-router-dom";

const { Header, Content } = Layout;

interface HeaderLayoutProps {
  children: React.ReactNode;
}

export default function HeaderLayout({ children }: HeaderLayoutProps) {
  const { instance: msalInstance } = useMsal();
  const { setUser } = useUserContext();

  return (
    <Layout className="min-h-screen">
      <Header className="flex items-center justify-between">
        <h1 className="text-xl text-white">Project Allocator</h1>
        <AuthRoute>
          <Dropdown
            menu={{
              items: [
                {
                  key: "profile",
                  label: <Link to="/profile">Profile</Link>,
                  icon: <UserOutlined />,
                },
                {
                  key: "signout",
                  label: (
                    <div onClick={
                      async () => {
                        await msalInstance.logout();
                        setUser(undefined);
                      }}
                    >
                      Sign Out
                    </div>
                  ),
                  icon: <LogoutOutlined />,
                },
              ]
            }}
            className="bg-transparent text-white"
          >
            <Button>
              <Space>
                Account
                <DownOutlined />
              </Space>
            </Button>
          </Dropdown>
        </AuthRoute>
      </Header>
      <Content className="grid">
        {children}
      </Content>
    </Layout>
  );
}
