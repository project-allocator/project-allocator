import { Layout, Result } from "antd";
import { Content } from "antd/es/layout/layout";
import { useRouteError } from "react-router-dom";
import Header from "./Header";

export default function Error() {
  const error = useRouteError() as any;

  return (
    <Layout className="min-h-screen">
      <Header />
      <Content className="grid place-content-center">
        <Result status={error.status} title={error.status} subTitle={error.statusText} />
      </Content>
    </Layout>
  );
}
