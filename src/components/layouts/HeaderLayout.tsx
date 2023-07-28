import { NotificationRead, NotificationService } from "@/api";
import { useUserContext } from "@/contexts/UserContext";
import AuthRoute from "@/routes/AuthRoute";
import { DeleteOutlined, DownOutlined, LogoutOutlined, NotificationOutlined, UserOutlined } from "@ant-design/icons";
import { useMsal } from "@azure/msal-react";
import { Badge, Button, Card, Drawer, Dropdown, Empty, Layout, Space, Tooltip, Typography } from "antd";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const { Text } = Typography;
const { Header, Content } = Layout;

interface HeaderLayoutProps {
  children: React.ReactNode;
}

export default function HeaderLayout({ children }: HeaderLayoutProps) {
  const { instance: msalInstance } = useMsal();
  const { setUser } = useUserContext();

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationRead[]>([]);
  useEffect(() => {
    const fetchNotifications = () => {
      NotificationService.readNotifications()
        .then((notifications) => setNotifications(notifications as NotificationRead[]));
    }
    fetchNotifications();
    setInterval(fetchNotifications, 60000);
  }, [])

  return (
    <Layout className="min-h-screen">
      <Header className="flex items-center justify-between bg-black">
        <h1 className="text-xl text-white">Project Allocator</h1>
        <AuthRoute>
          <Space>
            <Dropdown
              className="bg-transparent text-white"
              menu={{
                items: [
                  {
                    key: "profile",
                    label: <Link to="/profile">Profile</Link>,
                    icon: <UserOutlined />,
                  },
                  {
                    key: "signout",
                    label: "Sign Out",
                    icon: <LogoutOutlined />,
                    onClick: async () => {
                      await msalInstance.logoutPopup();
                      setUser(undefined);
                    }
                  },
                ]
              }}
            >
              <Button>
                <Space>
                  Account
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>
            <Badge count={notifications.filter((notification) => !notification.seen).length}>
              <Button
                className="bg-transparent text-white"
                icon={<NotificationOutlined />}
                onClick={() => setOpen(true)}
              />
            </Badge>
          </Space>
        </AuthRoute>
      </Header>
      <Drawer
        title="Notifications"
        placement="right"
        open={open}
        onClose={() => {
          setOpen(false);
          NotificationService.markNotifications(notifications.filter((item) => !item.seen));
          setNotifications(notifications.map((item) => ({ ...item, seen: false })))
        }}
      >
        <Space direction="vertical" className="w-full">
          {notifications.length > 0 ?
            notifications.map((notification) => (
              <Card
                key={notification.id}
                size="small"
                className={notification.seen ? "opacity-50" : ""}
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <Text strong>{notification.title}</Text>
                    <Text>{notification.description}</Text>
                  </div>
                  <Tooltip title="Dismiss">
                    <Button
                      className="border-none"
                      icon={<DeleteOutlined />}
                      onClick={() => {
                        NotificationService.deleteNotification(notification.id);
                        setNotifications(notifications.filter((item) => item.id !== notification.id))
                      }}
                    />
                  </Tooltip>
                </div>
              </Card>
            ))
            : <Empty />}
        </Space>
      </Drawer>
      <Content className="grid">
        {children}
      </Content>
    </Layout >
  );
}
