import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import PageHeader from "./PageHeader";

const { Content } = Layout;

export default function CenterLayout() {
  return (
    <Layout className="min-h-screen">
      <PageHeader />
      <Content className="grid place-content-center">
        <Outlet />
      </Content>
    </Layout>
  );
}
