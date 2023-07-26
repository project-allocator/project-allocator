import { Layout } from "antd";

interface CenterLayoutProps {
  children: React.ReactNode;
}

export default function CenterLayout({ children }: CenterLayoutProps) {
  return (
    <Layout className="grid place-content-center">
      {children}
    </Layout>
  );
}