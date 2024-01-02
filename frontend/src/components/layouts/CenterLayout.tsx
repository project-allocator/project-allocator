import { Layout, Spin } from "antd";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Outlet } from "react-router-dom";
import Fallback from "./Fallback";
import Header from "./Header";

const { Content } = Layout;

export default function CenterLayout() {
  return (
    <Layout className="min-h-screen">
      <Header />
      <Content className="grid place-content-center">
        <ErrorBoundary FallbackComponent={Fallback}>
          <Suspense fallback={<Spin fullscreen />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </Content>
    </Layout>
  );
}
