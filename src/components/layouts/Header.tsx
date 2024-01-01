import { useAuth, useCurrentUser, useLogoutUser } from "@/hooks/users";
import { DownOutlined, LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Dropdown, Layout, Space } from "antd";
import { Suspense } from "react";
import { Link } from "react-router-dom";

export default function Header({ button }: { button?: React.ReactNode }) {
  const { isAuth } = useAuth();

  return (
    <Layout.Header className="flex items-center justify-between bg-black">
      <h1 className="text-xl text-white">Project Allocator</h1>
      <Space>
        {isAuth && (
          <Suspense>
            <HeaderDropdown />
          </Suspense>
        )}
        {button}
      </Space>
    </Layout.Header>
  );
}

function HeaderDropdown() {
  const user = useCurrentUser();
  const logoutUser = useLogoutUser();

  const items = [
    {
      key: "profile",
      label: <Link to={`/users/${user.data.id}`}>Profile</Link>,
      icon: <UserOutlined />,
    },
    {
      key: "signout",
      label: "Sign Out",
      icon: <LogoutOutlined />,
      onClick: () => logoutUser.mutate(),
    },
  ];

  return (
    <Dropdown className="bg-transparent text-white" menu={{ items }}>
      <Button>
        <Space>
          Account
          <DownOutlined />
        </Space>
      </Button>
    </Dropdown>
  );
}
