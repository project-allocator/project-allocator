import { useCurrentUser, useCurrentUserRole } from "@/hooks/users";
import Loading from "@/pages/Loading";
import { FileAddOutlined, FileDoneOutlined, FileTextOutlined, LockOutlined } from "@ant-design/icons";
import { Layout, Menu } from "antd";
import { Link, useLocation } from "react-router-dom";

const { Sider } = Layout;

export default function PageSider() {
  const { pathname } = useLocation();
  const user = useCurrentUser();
  const { isAdmin, isStaff, isStudent } = useCurrentUserRole();

  if (user.isLoading) return <Loading />;
  if (user.isError) return null;

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
    <Sider width={300} className="min-h-screen">
      <Menu
        mode="inline"
        items={items.filter((item) => item) as any[]}
        defaultSelectedKeys={[pathname]}
        className="h-full"
      />
    </Sider>
  );
}
