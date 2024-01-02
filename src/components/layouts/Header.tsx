import { useMessage } from "@/contexts/MessageContext";
import { useSpin } from "@/contexts/SpinContext";
import { useAuth, useCurrentUser, useSignOutUser } from "@/hooks/users";
import { DownOutlined, LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Dropdown, Layout, Space } from "antd";
import { Suspense } from "react";
import { Link, useNavigate } from "react-router-dom";

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
  const signOutUser = useSignOutUser();
  const navigate = useNavigate();
  const { messageSuccess, messageError } = useMessage();
  const { setIsSpinning } = useSpin();

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
      onClick: () => {
        setIsSpinning(true);
        signOutUser.mutate(undefined, {
          onSuccess: () => {
            messageSuccess("Successfully signed out.");
            navigate("/signin");
          },
          onError: () => messageError("Failed to sign out."),
          onSettled: () => setIsSpinning(false),
        });
      },
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
