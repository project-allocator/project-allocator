import Loading from '@/components/Loading';
import MessageContext from '@/contexts/message';
import { getData } from '@/services/client';
import { ProjectRead } from '@/services/projects';
import { showErrorMessage } from '@/utils';
import { Divider, Space, Table, Tag, Typography } from 'antd';
import { useContext } from 'react';

const { Title } = Typography;

const columns = [
  {
    title: 'Title',
    render: (project: ProjectRead) => <a href={`/projects/${project.id}`}>{project.title}</a>,
  },
  {
    title: 'Description',
    render: (project: ProjectRead) => project.description.slice(0, 500) + '...'
  },
  {
    title: 'Categories',
    render: (project: ProjectRead) => (
      <Space className='flex-wrap min-w-xl'>
        {project.categories.map((category: string) => <Tag key={category}>{category}</Tag>)}
      </Space>
    ),
  },
];

export default function ProposedProjects() {
  // Call the internal Graph QL API
  const { data, loading, error } = getData();

  const message = useContext(MessageContext)!;
  if (loading) return <Loading />;
  if (error) showErrorMessage(message, error);

  const projects = data!.projects?.map((project: ProjectRead) => ({
    ...project,
    key: project.id,
  }))

  return (
    <>
      <Title level={3}>List of Proposed Projects</Title>
      <Divider />
      <Table
        rowSelection={{ type: 'checkbox' }}
        columns={columns}
        dataSource={projects}
      />
    </>
  );
};
