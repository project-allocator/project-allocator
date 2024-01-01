import { useAuth } from "@/hooks/users";
import { FileAddOutlined, FileDoneOutlined, FileTextOutlined, LockOutlined } from "@ant-design/icons";
import { Layout, Menu } from "antd";
import { Link, useLocation } from "react-router-dom";

export default function Sider() {
  const { pathname } = useLocation();
  const { isAdmin, isStaff, isStudent } = useAuth();

  const items = [
    {
      key: "/projects",
      icon: <FileTextOutlined />,
      label: <Link to="/projects">All Projects</Link>,
    },
    (isStaff || isAdmin) && {
      key: "/proposed",
      icon: <FileAddOutlined />,
      label: <Link to="/proposed">Proposed Projects</Link>,
    },
    isStudent && {
      key: "/allocated",
      icon: <FileDoneOutlined />,
      label: <Link to="/allocated">Allocated Project</Link>,
    },
    isStudent && {
      key: "/shortlisted",
      icon: <FileDoneOutlined />,
      label: <Link to="/shortlisted">Shortlisted Projects</Link>,
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
