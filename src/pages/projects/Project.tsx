import { AllocationService, ProjectRead, ProjectService, ProposalService, ShortlistService, UserRead } from "@/api";
import { ProjectView } from "@/components/ProjectView";
import StaffRoute from "@/routes/StaffRoute";
import StudentRoute from "@/routes/StudentRoute";
import { getInitialLetters } from "@/utils";
import { DeleteOutlined, EditOutlined, HeartOutlined } from '@ant-design/icons';
import { Avatar, Button, Divider, List, Space, Tag, Tooltip, Typography } from "antd";
import { Link, useLoaderData, useLocation, useNavigate, useRevalidator, type LoaderFunctionArgs } from 'react-router-dom';

const { Title } = Typography;

export async function projectLoader({ params }: LoaderFunctionArgs) {
  const id = parseInt(params.id!);
  const project = await ProjectService.readProject(id);
  const isProposed = await ProposalService.isProposed(id);
  const shortlisters = await ShortlistService.readShortlisters(id);
  const isShortlisted = await ShortlistService.isShortlisted(id);
  const allocatees = await AllocationService.readAllocatees(id);
  const isAllocated = await AllocationService.isAllocated(id);
  return [project, isProposed, shortlisters, isShortlisted, allocatees, isAllocated];
}

export default function Project() {
  const [project, isProposed, shortlisters, isShortlisted, allocatees, isAllocated]
    = useLoaderData() as [ProjectRead, boolean, UserRead[], boolean, UserRead[], boolean];
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
          <Space>
            {isAllocated &&
              <Tag color="success">Allocated</Tag>}
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
          </Space>
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
      <ProjectView project={project} />
      <StaffRoute>
        {isProposed &&
          <>
            <Title level={4}>Allocated Students</Title>
            <List
              className="mt-4"
              itemLayout="horizontal"
              dataSource={allocatees}
              renderItem={(allocatee) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar>{getInitialLetters(allocatee.name)}</Avatar>}
                    title={<Link to={`/users/${allocatee.id}`}>{allocatee.name}</Link>}
                    description={allocatee.email}
                  />
                </List.Item>
              )}
            />
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