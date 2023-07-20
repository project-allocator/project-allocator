import { DownOutlined, LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Dropdown, Layout, MenuProps, Space } from "antd";
import { Link } from "react-router-dom";

const { Header, Content } = Layout;

const menuItems: MenuProps["items"] = [
  {
    key: "profile",
    // TODO: Setup correct link to individual user profile
    label: <Link to="/users/1">Profile</Link>,
    icon: <UserOutlined />,
  },
  {
    key: "signout",
    label: (
      <Link
        to="/api/auth/signout"
        onClick={(event) => {
          event.preventDefault();
          // TODO: Setup auth
          // signOut();
        }}
      >
        Sign Out
      </Link>
    ),
    icon: <LogoutOutlined />,
  },
];

interface HeaderLayoutProps {
  children: React.ReactNode;
};

export default function HeaderLayout({ children }: HeaderLayoutProps) {
  // Get session from Next Auth
  // const { data: session } = useSession();
  const session = {};

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
