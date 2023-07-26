import { toCapitalCase } from '@/utils';
import { FileAddOutlined, FileDoneOutlined, FileTextOutlined, HomeOutlined, LockOutlined } from '@ant-design/icons';
import { Breadcrumb, BreadcrumbProps, Layout, Menu, MenuProps } from 'antd';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const { Content, Sider } = Layout;

interface SiderLayoutProps {
  children: React.ReactNode;
};

export default function SiderLayout({ children }: SiderLayoutProps) {
  const { pathname } = useLocation();
  const dirnames: string[] = pathname.split('/').slice(1);
  const pathnames: string[] = dirnames.reduce((pathname: string[], dirname: string) =>
    [...pathname, `${pathname.at(-1) || ''}/${dirname}`], []);
  const breadcrumbItems: BreadcrumbProps['items'] = dirnames.map((dirname, index) => ({
    title: toCapitalCase(dirname),
    href: pathnames[index],
  }));

  const dropdownItems: MenuProps['items'] = [
    {
      key: 'projects',
      icon: <FileTextOutlined />,
      label: (
        <Link to="/projects">
          All Projects
        </Link>
      )
    },
    {
      key: 'proposed',
      icon: <FileAddOutlined />,
      label: (
        <Link to="/proposed">
          Proposed Projects
        </Link>
      )
    },
    {
      key: 'shortlisted',
      icon: <FileDoneOutlined />,
      label: (
        <Link to="/shortlisted">
          Shortlisted Projects
        </Link>
      )
    },
    {
      key: 'admin',
      icon: <LockOutlined />,
      label: (
        <Link to="/admin">
          Administration
        </Link>
      )
    }
  ];

  return (
    <Layout>
      <Sider width={300}>
        <Menu
          mode="inline"
          items={dropdownItems}
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
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}