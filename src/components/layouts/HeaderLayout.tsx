import { DownOutlined, LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { useMsal } from "@azure/msal-react";
import { Button, Dropdown, Layout, MenuProps, Space } from "antd";
import { Link } from "react-router-dom";

const { Header, Content } = Layout;

interface HeaderLayoutProps {
  children: React.ReactNode;
};

export default function HeaderLayout({ children }: HeaderLayoutProps) {
  // TODO: Get user data
  const session = {};

  const { instance } = useMsal();
  const menuItems: MenuProps["items"] = [
    {
      key: "profile",
      label: <Link to="/profile">Profile</Link>,
      icon: <UserOutlined />,
    },
    {
      key: "signout",
      label: (
        <div onClick={() => instance.logout()}>
          Sign Out
        </div>
      ),
      icon: <LogoutOutlined />,
    },
  ];

  return (
    <Layout className="min-h-screen">
      <Header className="flex items-center justify-between">
        <h1 className="text-xl text-white">Project Allocator</h1>
        {session && (
          <Dropdown
            menu={{ items: menuItems }}
            className="bg-transparent text-white"
          >
            <Button>
              <Space>
                Account
                <DownOutlined />
              </Space>
            </Button>
          </Dropdown>
        )}
      </Header>
      <Content className="grid">
        {children}
      </Content>
    </Layout>
  );
}
