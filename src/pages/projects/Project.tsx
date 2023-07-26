import { ProjectRead, ProjectService, ProposalService, ShortlistService, UserRead } from "@/api";
import config from "@/config";
import StaffRoute from "@/routes/StaffRoute";
import StudentRoute from "@/routes/StudentRoute";
import { getInitialLetters } from "@/utils";
import { DeleteOutlined, EditOutlined, HeartOutlined } from '@ant-design/icons';
import { Avatar, Button, Divider, List, Space, Tag, Tooltip, Typography } from "antd";
import dayjs from 'dayjs';
import { Link, useLoaderData, useLocation, useNavigate, useRevalidator, type LoaderFunctionArgs } from 'react-router-dom';

const { Title, Paragraph } = Typography;

export async function projectLoader({ params }: LoaderFunctionArgs) {
  const project = await ProjectService.readProject(parseInt(params.id!));
  const isProposed = await ProposalService.isProposed(parseInt(params.id!));
  const shortlisters = await ShortlistService.readShortlisters(parseInt(params.id!));
  const isShortlisted = await ShortlistService.isShortlisted(parseInt(params.id!));
  return [project, isProposed, shortlisters, isShortlisted];
}

export default function Project() {
  const [project, isProposed, shortlisters, isShortlisted]
    = useLoaderData() as [ProjectRead, boolean, UserRead[], boolean];
  const revalidator = useRevalidator();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      <Space className="flex items-end justify-between">
        <Title level={3} className="mb-0">
          Project #{project.id}
        </Title>
        <StudentRoute>
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
        </StudentRoute>
        <StaffRoute>
          {isProposed &&
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
                  onClick={async () => {
                    await ProjectService.deleteProject(project.id);
                    // Navigate back to either '/projects' or '/proposed'
                    // or to '/projects' if the history stack is empty.
                    location.key === 'default'
                      ? navigate('/projects')
                      : navigate(-1);
                  }}
                />
              </Tooltip>
            </Space>}
        </StaffRoute>
      </Space>
      <Divider />
      <Title level={4}>Title</Title>
      <Paragraph>{project.title}</Paragraph>
      <Title level={4}>Description</Title>
      <Paragraph>{project.description}</Paragraph>
      {config.project.details.map((detail) => (
        <div key={detail.name}>
          <Title level={4}>{detail.title}</Title>
          <Paragraph>
            {(() => {
              const value = project[detail.name as keyof ProjectRead];
              switch (detail.type) {
                case 'date':
                  return dayjs(value as string).format('DD/MM/YYYY');
                case 'time':
                  return dayjs(value as string).format('hh:mm:ss');
                case 'switch':
                  return value ? 'Yes' : 'No';
                case 'checkbox':
                  return Array(value).length > 0
                    ? Array(value).join(', ')
                    : "Not specified"
                default:
                  return value;
              }
            })()}
          </Paragraph>
        </div>
      ))}
      <Title level={4}>Categories</Title>
      <Space className="flex-wrap min-w-xl mt-2">
        {project.categories.length > 0
          ? project.categories.map((category: string) => (<Tag key={category}>{category}</Tag>))
          : "Not specified"}
      </Space>
      <StaffRoute>
        {isProposed &&
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
          </>}
      </StaffRoute>
    </>
  );
}