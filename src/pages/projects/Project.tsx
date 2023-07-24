import config from "@/config";
import { ProjectRead, ProjectService, ShortlistService, UserRead } from "@/services/api";
import { getInitialLetters } from "@/utils";
import { DeleteOutlined, EditOutlined, HeartOutlined } from '@ant-design/icons';
import { Avatar, Button, Divider, List, Space, Tag, Tooltip, Typography } from "antd";
import dayjs from 'dayjs';
import { Link, useLoaderData, useRevalidator, useSubmit, type LoaderFunctionArgs } from 'react-router-dom';

const { Title, Paragraph } = Typography;

export async function projectLoader({ params }: LoaderFunctionArgs) {
  const project = await ProjectService.readProject(parseInt(params.id!));
  const shortlisters = await ShortlistService.readShortlisters(parseInt(params.id!));
  const isShortlisted = await ShortlistService.isShortlisted(parseInt(params.id!));
  return [project, shortlisters, isShortlisted];
}

export default function Project() {
  const [project, shortlisters, isShortlisted] = useLoaderData() as [ProjectRead, UserRead[], boolean];
  const isStudent = false;
  const submit = useSubmit();
  const revalidator = useRevalidator();

  return (
    <>
      {/* TODO: Refactor!! */}
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
                  ? ShortlistService.setShortlisted(project.id)
                  : ShortlistService.unsetShortlisted(project.id);
                revalidator.revalidate();
              }}
            />
          </Tooltip>
        ) : (
          <Space>
            <Tooltip title="Edit">
              <Link to="./edit" >
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
      </Title >
      <Divider />
      <Title level={4}>Title</Title>
      <Paragraph>{project.title}</Paragraph>
      <Title level={4}>Description</Title>
      <Paragraph>{project.description}</Paragraph>
      {config.project.details.map((detail) => (
        <div key={detail.name}>
          <Title level={4}>{detail.title}</Title>
          <Paragraph>
            {({
              // TODO: Refactor!!
              // @ts-ignore
              'date': dayjs(project[detail.name]).format('DD/MM/YYYY'),
              // @ts-ignore
              'time': dayjs(project[detail.name]).format('hh:mm:ss'),
              // @ts-ignore
              'switch': project[detail.name] ? 'Yes' : 'No',
              // @ts-ignore
              'checkbox': Array(project[detail.name]).join(','),
              // @ts-ignore
            } as any)[detail.type] || project[detail.name]}
          </Paragraph>
        </div>
      ))}
      <Title level={4}>Categories</Title>
      <Space className="flex-wrap min-w-xl mt-2">
        {project.categories.map((category: string) => (
          <Tag key={category}>{category}</Tag>
        ))}
      </Space>
      {
        !isStudent && (
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
        )
      }
    </>
  );
}