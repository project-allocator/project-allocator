import { useUserContext } from '@/contexts/UserContext';
import { toCapitalCase } from '@/utils';
import { FileAddOutlined, FileDoneOutlined, FileTextOutlined, HomeOutlined, LockOutlined } from '@ant-design/icons';
import { Breadcrumb, BreadcrumbProps, Layout, Menu, Skeleton } from 'antd';
import { ItemType, MenuItemType } from 'antd/es/menu/hooks/useItems';
import React from 'react';
import { Link, useLocation, useNavigation } from 'react-router-dom';

const { Content, Sider } = Layout;

interface SiderLayoutProps {
  children: React.ReactNode;
}

export default function SiderLayout({ children }: SiderLayoutProps) {
  const navigation = useNavigation();
  const { user } = useUserContext();
  const { pathname } = useLocation();
  const dirnames: string[] = pathname.split('/').slice(1);
  const pathnames: string[] = dirnames.reduce((pathname: string[], dirname: string) =>
    [...pathname, `${pathname.at(-1) || ''}/${dirname}`], []);
  const breadcrumbItems: BreadcrumbProps['items'] = dirnames.map((dirname, index) => ({
    title: toCapitalCase(dirname),
    href: pathnames[index],
  }));

  return (
    <Layout>
      <Sider width={300}>
        <Menu
          mode="inline"
          items={[
            {
              key: 'projects',
              icon: <FileTextOutlined />,
              label: <Link to="/projects">All Projects</Link>,
            },
            (user?.role === 'staff' || user?.role === 'admin') &&
            {
              key: 'proposed',
              icon: <FileAddOutlined />,
              label: <Link to="/proposed">Proposed Projects</Link>,
            },
            user?.role === 'student' &&
            {
              key: 'allocated',
              icon: <FileDoneOutlined />,
              label: <Link to="/allocated">Allocated Project</Link>,
            },
            user?.role === 'student' &&
            {
              key: 'shortlisted',
              icon: <FileDoneOutlined />,
              label: <Link to="/shortlisted">Shortlisted Projects</Link>,
            },
            user?.role === 'admin' &&
            {
              key: 'admin',
              icon: <LockOutlined />,
              label: <Link to="/admin">Administration</Link>,
            }
          ] as ItemType<MenuItemType>[]}
          defaultSelectedKeys={[dirnames[0]]}
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
            ...breadcrumbItems
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