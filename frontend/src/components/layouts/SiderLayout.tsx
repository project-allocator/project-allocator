import { useNotifications } from "@/hooks/notifications";
import { NotificationOutlined } from "@ant-design/icons";
import { Badge, Button, Layout, Skeleton } from "antd";
import { Suspense, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Outlet } from "react-router-dom";
import Breadcrumb from "./Breadcrumb";
import Drawer from "./Drawer";
import Fallback from "./Fallback";
import Header from "./Header";
import Sider from "./Sider";

const { Content } = Layout;

export default function SiderLayout() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSiderCollapsed, setIsSiderCollapsed] = useState(true);

  const notifications = useNotifications(); // does not throw error
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
      <Drawer isOpen={isDrawerOpen} setIsOpen={setIsDrawerOpen} />
      <Layout>
        <Sider isCollapsed={isSiderCollapsed} setIsCollapsed={setIsSiderCollapsed} />
        {isSiderCollapsed && (
          <Layout className="pt-0 p-2 md:p-6">
            <Breadcrumb />
            <Content className="m-0 p-4 md:p-8 bg-white">
              <ErrorBoundary FallbackComponent={Fallback}>
                <Suspense fallback={<Skeleton active />}>
                  <Outlet />
                </Suspense>
              </ErrorBoundary>
            </Content>
          </Layout>
        )}
      </Layout>
    </Layout>
  );
}
