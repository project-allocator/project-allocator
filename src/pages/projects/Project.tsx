import client from "@/services/api";
import type { Project } from "@/types";
import { DeleteOutlined, EditOutlined, HeartOutlined } from '@ant-design/icons';
import { Button, Divider, Space, Tooltip, Typography } from "antd";
import { useLoaderData, useSearchParams, type LoaderFunctionArgs } from 'react-router-dom';

const { Title, Paragraph } = Typography;

export async function loader({ params }: LoaderFunctionArgs) {
  const { data } = await client.get(`/projects/${params.id}`);
  return data;
}

export default function Project() {
  const project = useLoaderData() as Project;
  const [params] = useSearchParams();
  const isStudent = params.get('student') !== null;

  return (
    <>
      <Title level={3} className="flex justify-between items-center">
        Project #{project.id}
        {isStudent ? (
          <Tooltip title="Shortlist">
            <Button shape="circle" icon={<HeartOutlined />} />
          </Tooltip>
        ) : (
          <Space>
            <Tooltip title="Edit">
              <Button href={`./${project.id}/edit`} shape="circle" icon={<EditOutlined />} />
            </Tooltip>
            <Tooltip title="Delete">
              <Button shape="circle" icon={<DeleteOutlined />} />
            </Tooltip>
          </Space>
        )}
      </Title>
      <Divider />
      <Title level={4}>Title</Title>
      <Paragraph>{project.title}</Paragraph>
      <Title level={4}>Description</Title>
      <Paragraph>{project.description}</Paragraph>
      <Title level={4}>Categories</Title>
      {/* TODO: Bring back categories view */}
      {/* <Space className="flex-wrap min-w-xl">
        {project.categories.map((category: string) => (
          <Tag key={category}>{category}</Tag>
        ))}
      </Space> */}
    </>
  );
}