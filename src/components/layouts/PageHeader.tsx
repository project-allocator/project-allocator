import { useCurrentUser, useLogoutUser } from "@/hooks/users";
import { DownOutlined, LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Dropdown, Layout, Space } from "antd";
import { Link } from "react-router-dom";

const { Header } = Layout;

export default function PageHeader({ button }: { button?: React.ReactNode }) {
  const user = useCurrentUser();

  return (
    <Header className="flex items-center justify-between bg-black">
      <h1 className="text-xl text-white">Project Allocator</h1>
      {user.data && (
        <Space>
          <PageHeaderDropdown />
          {button}
        </Space>
      )}
    </Header>
  );
}

function PageHeaderDropdown() {
  const user = useCurrentUser();
  const logoutUser = useLogoutUser();

  if (user.isLoading || user.isError) return null;

  return (
    <Dropdown
      className="bg-transparent text-white"
      menu={{
        items: [
          {
            key: "profile",
            label: <Link to={`/users/${user.data!.id}`}>Profile</Link>,
            icon: <UserOutlined />,
          },
          {
            key: "signout",
            label: "Sign Out",
            icon: <LogoutOutlined />,
            onClick: () => logoutUser.mutate(),
          },
        ],
      }}
    >
      <Button>
        <Space>
          Account
          <DownOutlined />
        </Space>
      </Button>
    </Dropdown>
  );
}
