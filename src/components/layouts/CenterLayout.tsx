import { Layout, Skeleton } from "antd";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Outlet } from "react-router-dom";
import Error from "./Error";
import Header from "./Header";

const { Content } = Layout;

export default function CenterLayout() {
  return (
    <Layout className="min-h-screen">
      <Header />
      <Content className="grid place-content-center">
        <ErrorBoundary FallbackComponent={Error}>
          <Suspense fallback={<Skeleton active />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </Content>
    </Layout>
  );
}
