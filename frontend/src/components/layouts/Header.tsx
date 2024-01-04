import { useAuth, useCurrentUser } from "@/hooks/users";
import { DownOutlined, LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { useMsal } from "@azure/msal-react";
import { Button, Dropdown, Layout, Space } from "antd";
import { Suspense } from "react";
import { Link } from "react-router-dom";

export default function Header({ button }: { button?: React.ReactNode }) {
  const { isAuth } = useAuth();

  return (
    <Layout.Header className="flex items-center justify-between px-8 md:px-16 bg-black">
      <h1 className="text-lg md:text-xl text-white">Project Allocator</h1>
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
  const { instance: msalInstance } = useMsal();

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
      onClick: () => msalInstance.logoutRedirect(),
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
