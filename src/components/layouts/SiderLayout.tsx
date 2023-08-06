import { useUser } from '@/contexts/UserContext';
import { toCapitalCase } from '@/utils';
import { FileAddOutlined, FileDoneOutlined, FileTextOutlined, HomeOutlined, LockOutlined } from '@ant-design/icons';
import { Breadcrumb, Layout, Menu, Skeleton } from 'antd';
import { ItemType, MenuItemType } from 'antd/es/menu/hooks/useItems';
import React from 'react';
import { Link, useLocation, useNavigation } from 'react-router-dom';

const { Content, Sider } = Layout;

interface SiderLayoutProps {
  children: React.ReactNode;
}

export default function SiderLayout({ children }: SiderLayoutProps) {
  const navigation = useNavigation();
  const { user } = useUser();
  const { pathname } = useLocation();
  const dirnames: string[] = pathname.split('/').slice(1);
  const pathnames: string[] = dirnames.reduce((pathname: string[], dirname: string) =>
    [...pathname, `${pathname.at(-1) || ''}/${dirname}`], []);

  return (
    <Layout>
      <Sider width={300}>
        <Menu
          mode="inline"
          items={[
            {
              key: '/projects',
              icon: <FileTextOutlined />,
              label: <Link to="/projects">All Projects</Link>,
            },
            (user?.role === 'staff' || user?.role === 'admin') &&
            {
              key: '/proposed',
              icon: <FileAddOutlined />,
              label: <Link to="/proposed">Proposed Projects</Link>,
            },
            user?.role === 'student' &&
            {
              key: '/allocated',
              icon: <FileDoneOutlined />,
              label: <Link to="/allocated">Allocated Project</Link>,
            },
            user?.role === 'student' &&
            {
              key: '/shortlisted',
              icon: <FileDoneOutlined />,
              label: <Link to="/shortlisted">Shortlisted Projects</Link>,
            },
            user?.role === 'admin' &&
            {
              icon: <LockOutlined />,
              label: "Administration",
              children: [
                {
                  key: '/admin/users',
                  icon: <LockOutlined />,
                  label: <Link to="/admin/users">Manage Users</Link>,
                },
                {
                  key: '/admin/projects',
                  icon: <LockOutlined />,
                  label: <Link to="/admin/projects">Manage Projects</Link>,
                },
                {
                  key: '/admin/allocations',
                  icon: <LockOutlined />,
                  label: <Link to="/admin/allocations">Manage Allocations</Link>,
                },
                {
                  key: '/admin/data',
                  icon: <LockOutlined />,
                  label: <Link to="/admin/data">Import/Export Data</Link>,
                },
              ]
            }
          ] as ItemType<MenuItemType>[]}
          defaultSelectedKeys={[pathname]}
          className='h-full'
        />
      </Sider>
      <Layout className='px-6 pb-6'>
        <Breadcrumb
          items={[
            {
              title: <HomeOutlined />,
              href: '/'
            },
            ...dirnames.map((dirname, index) => ({
              title: toCapitalCase(dirname),
              href: pathnames[index],
            }))
          ]}
          className='my-4'
        />
        <Content className='p-8 m-0 bg-white'>
          {navigation.state === "loading" ? <Skeleton active /> : children}
        </Content>
      </Layout>
    </Layout>
  )
}