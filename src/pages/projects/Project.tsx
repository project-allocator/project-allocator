import client from "@/services/api";
import type { Project, User } from "@/types";
import { getInitialLetters } from "@/utils";
import { DeleteOutlined, EditOutlined, HeartOutlined } from '@ant-design/icons';
import { Avatar, Button, Divider, List, Space, Tag, Tooltip, Typography } from "antd";
import { Link, useLoaderData, useRevalidator, useSubmit, type LoaderFunctionArgs } from 'react-router-dom';

const { Title, Paragraph } = Typography;

export async function projectLoader({ params }: LoaderFunctionArgs) {
  const { data } = await client.get(`/projects/${params.id}`);
  const { data: shortlisters } = await client.get(`/projects/${params.id}/shortlisters`);
  const { data: isShortlisted } = await client.get(`/users/me/shortlisted/${params.id}`);
  return [data, shortlisters, isShortlisted];
}

export default function Project() {
  const [project, shortlisters, isShortlisted] = useLoaderData() as [Project, User[], boolean];
  const isStudent = false;
  const submit = useSubmit();
  const revalidator = useRevalidator();

  return (
    <>
      <Title level={3} className="flex justify-between items-center">
        Project #{project.id}
        {isStudent ? (
          <Tooltip title="Shortlist">
            <Button
              shape="circle"
              icon={<HeartOutlined />}
              type={isShortlisted ? "primary" : "default"}
              onClick={async () => {
                await !isShortlisted
                  ? client.post(`/users/me/shortlisted/${project.id}`)
                  : client.delete(`/users/me/shortlisted/${project.id}`);
                revalidator.revalidate();
              }}
            />
          </Tooltip>
        ) : (
          <Space>
            <Tooltip title="Edit">
              <Link to={`./${project.id}/edit`} >
                <Button shape="circle" icon={<EditOutlined />} />
              </Link>
            </Tooltip>
            <Tooltip title="Delete">
              <Button
                shape="circle"
                icon={<DeleteOutlined />}
                onClick={() =>
                  submit(null, {
                    method: 'post',
                    action: 'delete'
                  })
                }
              />
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
      <Space className="flex-wrap min-w-xl mt-2">
        {project.categories.map((category: string) => (
          <Tag key={category}>{category}</Tag>
        ))}
      </Space>
      {!isStudent && (
        <>
          <Title level={4}>Shortlisted Students</Title>
          <List
            className="mt-4"
            itemLayout="horizontal"
            dataSource={shortlisters}
            renderItem={(shortlister) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar>{getInitialLetters(shortlister.name)}</Avatar>}
                  title={<Link to={`/users/${shortlister.id}`}>{shortlister.name}</Link>}
                  description={shortlister.email}
                />
              </List.Item>
            )}
          />
        </>
      )}
    </>
  );
}