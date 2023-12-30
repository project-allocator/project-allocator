import { useNotifications } from "@/hooks/notifications";
import { NotificationOutlined } from "@ant-design/icons";
import { Badge, Button, Layout } from "antd";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import PageBreadcrumb from "./PageBreadcrumb";
import PageDrawer from "./PageDrawer";
import PageHeader from "./PageHeader";
import PageSider from "./PageSider";

const { Content } = Layout;

export default function SiderLayout() {
  const notifications = useNotifications();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const count = notifications.data?.filter((notification) => !notification.read_at).length || 0;

  return (
    <Layout className="min-h-screen">
      <PageHeader
        button={
          <Badge count={count}>
            <Button
              className="bg-transparent text-white"
              icon={<NotificationOutlined />}
              onClick={() => setIsDrawerOpen(true)}
            />
          </Badge>
        }
      />
      <PageDrawer open={isDrawerOpen} setOpen={setIsDrawerOpen} />
      <Layout>
        <PageSider />
        <Layout className="px-6 pb-6">
          <PageBreadcrumb />
          <Content className="p-8 m-0 bg-white">
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}
