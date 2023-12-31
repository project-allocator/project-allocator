import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import Header from "./Header";

const { Content } = Layout;

export default function CenterLayout() {
  return (
    <Layout className="min-h-screen">
      <Header />
      <Content className="grid place-content-center">
        <Outlet />
      </Content>
    </Layout>
  );
}
