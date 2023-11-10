import { Layout } from "antd";

interface CenterLayoutProps {
  children: React.ReactNode;
}

export default function CenterLayout({ children }: CenterLayoutProps) {
  return (
    <Layout className="min-h-screen grid place-content-center">
      {children}
    </Layout>
  );
}
