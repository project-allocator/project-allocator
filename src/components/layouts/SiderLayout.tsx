import { useNotifications } from "@/hooks/notifications";
import { NotificationOutlined } from "@ant-design/icons";
import { Badge, Button, Layout } from "antd";
import { useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Outlet } from "react-router-dom";
import Breadcrumb from "./Breadcrumb";
import Drawer from "./Drawer";
import Error from "./Error";
import Header from "./Header";
import Sider from "./Sider";

const { Content } = Layout;

export default function SiderLayout() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const notifications = useNotifications();
  const notificationCount = notifications.data?.filter((notification) => !notification.read_at).length || 0;

  return (
    <Layout className="min-h-screen">
      <Header
        button={
          <Badge count={notificationCount}>
            <Button
              className="bg-transparent text-white"
              icon={<NotificationOutlined />}
              onClick={() => setIsDrawerOpen(true)}
            />
          </Badge>
        }
      />
      <Drawer open={isDrawerOpen} setOpen={setIsDrawerOpen} />
      <Layout>
        <Sider />
        <Layout className="px-6 pb-6">
          <Breadcrumb />
          <Content className="p-8 m-0 bg-white">
            <ErrorBoundary FallbackComponent={Error}>
              <Outlet />
            </ErrorBoundary>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}
