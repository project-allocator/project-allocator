import { toCapitalCase } from '@/utils';
import { FileAddOutlined, FileDoneOutlined, FileTextOutlined, HomeOutlined } from '@ant-design/icons';
import { Breadcrumb, BreadcrumbProps, Layout, Menu, MenuProps } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';

const { Content, Sider } = Layout;

const dropdownItems: MenuProps['items'] = [
  {
    key: 'all',
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
      <Link to="/projects/proposed">
        Proposed Projects
      </Link>
    )
  },
  {
    key: 'shortlisted',
    icon: <FileDoneOutlined />,
    label: (
      <Link to="/projects/shortlisted">
        Shortlisted Projects
      </Link>
    )
  },
];

type Props = {
  children: React.ReactNode
};

export default function SiderLayout({ children }: Props) {
  // TODO: Setup react router
  // const { asPath } = useRouter();
  const asPath = '';
  const dirnames: string[] = asPath.split('/').slice(1);
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
          items={dropdownItems}
          // TODO: Refine logic to show default selected item
          defaultSelectedKeys={
            dirnames[0] === 'projects'
              ? [dirnames.length === 1 ? 'all' : dirnames[2]] : []}
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