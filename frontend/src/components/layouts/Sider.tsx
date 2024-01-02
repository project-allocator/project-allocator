import { useAuth } from "@/hooks/users";
import { FileAddOutlined, FileDoneOutlined, FileTextOutlined, LockOutlined } from "@ant-design/icons";
import { Layout, Menu } from "antd";
import { Link, useLocation } from "react-router-dom";

export default function Sider() {
  const { isAdmin, isStaff, isStudent } = useAuth();
  const { pathname } = useLocation();

  const items = [
    {
      key: "/projects",
      icon: <FileTextOutlined />,
      label: <Link to="/projects">All Projects</Link>,
    },
    (isStaff || isAdmin) && {
      key: "/projects/proposed-projects",
      icon: <FileAddOutlined />,
      label: <Link to="/projects/proposed-projects">Proposed Projects</Link>,
    },
    isStudent && {
      key: "/projects/allocated-project",
      icon: <FileDoneOutlined />,
      label: <Link to="/projects/allocated-project">Allocated Project</Link>,
    },
    isStudent && {
      key: "/projects/shortlisted-projects",
      icon: <FileDoneOutlined />,
      label: <Link to="/projects/shortlisted-projects">Shortlisted Projects</Link>,
    },
    isAdmin && {
      icon: <LockOutlined />,
      label: "Administration",
      children: [
        {
          key: "/admins/users",
          icon: <LockOutlined />,
          label: <Link to="/admins/users">Manage Users</Link>,
        },
        {
          key: "/admins/projects",
          icon: <LockOutlined />,
          label: <Link to="/admins/projects">Manage Projects</Link>,
        },
        {
          key: "/admins/allocations",
          icon: <LockOutlined />,
          label: <Link to="/admins/allocations">Manage Allocations</Link>,
        },
        {
          key: "/admins/notifications",
          icon: <LockOutlined />,
          label: <Link to="/admins/notifications">Manage Notifications</Link>,
        },
        {
          key: "/admins/data",
          icon: <LockOutlined />,
          label: <Link to="/admins/data">Manage Data</Link>,
        },
      ],
    },
  ];

  return (
    // TODO: Can width be specified by CSS?
    <Layout.Sider width={300} className="min-h-screen">
      <Menu
        mode="inline"
        items={items.filter((item) => item) as any[]}
        defaultSelectedKeys={[pathname]}
        className="h-full"
      />
    </Layout.Sider>
  );
}