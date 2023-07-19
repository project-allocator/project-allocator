import { Layout } from "antd";

interface Props {
  children: React.ReactNode;
};

export default function CenterLayout({ children }: Props) {
  return (
    <Layout className="grid place-content-center">
      {children}
    </Layout>
  );
}