import { AllocationService, ProjectRead, ProjectService, ProposalService, ShortlistService, UserRead } from "@/api";
import { ProjectView } from "@/components/ProjectView";
import { useMessageContext } from "@/contexts/MessageContext";
import StaffRoute from "@/routes/StaffRoute";
import StudentRoute from "@/routes/StudentRoute";
import { getInitialLetters } from "@/utils";
import { CheckOutlined, DeleteOutlined, EditOutlined, HeartOutlined } from '@ant-design/icons';
import { Avatar, Button, Divider, List, Space, Tooltip, Typography } from "antd";
import { useState } from "react";
import { Link, useLoaderData, useLocation, useNavigate, type LoaderFunctionArgs } from 'react-router-dom';

const { Title, Paragraph } = Typography;

export async function projectLoader({ params }: LoaderFunctionArgs) {
  const id = parseInt(params.id!);
  const project = await ProjectService.readProject(id);
  const isProposed = await ProposalService.isProposed(id);
  const allocatees = await AllocationService.readAllocatees(id);
  const isAllocated = await AllocationService.isAllocated(id);
  const shortlisters = await ShortlistService.readShortlisters(id);
  const isShortlisted = await ShortlistService.isShortlisted(id);
  return [project, isProposed, allocatees, isAllocated, shortlisters, isShortlisted];
}

export default function Project() {
  const [project, isProposed, allocatees, isAllocated, shortlisters, isShortlisted_]
    = useLoaderData() as [ProjectRead, boolean, UserRead[], boolean, UserRead[], boolean];
  // Use isShortlisted in state to show the change immediagely in the UI.
  const [isShortlisted, setIsShortlisted] = useState(isShortlisted_);
  const navigate = useNavigate();
  const location = useLocation();
  const { messageSuccess } = useMessageContext();

  return (
    <>
      <Space className="flex items-end justify-between">
        <Title level={3} className="mb-0">
          Project #{project.id}
        </Title>
        <StudentRoute>
          <Space>
            {isAllocated &&
              <Tooltip title="Allocated">
                <Button
                  shape="circle"
                  type="primary"
                  icon={<CheckOutlined />}
                />
              </Tooltip>}
            <Tooltip title="Shortlist">
              <Button
                shape="circle"
                icon={<HeartOutlined />}
                type={isShortlisted ? "primary" : "default"}
                onClick={async () => {
                  setIsShortlisted(!isShortlisted);
                  await !isShortlisted
                    ? ShortlistService.setShortlisted(project.id)
                    : ShortlistService.unsetShortlisted(project.id);
                  messageSuccess(isShortlisted
                    ? "Successfully unshortlisted project."
                    : "Successfully shortlisted project.");
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
            <Divider />
            <Title level={4}>Allocated Students</Title>
            <Paragraph className="text-slate-500">
              List of students allocated by the administrator will be shown here.
            </Paragraph>
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
            <Divider />
            <Title level={4}>Shortlisted Students</Title>
            <Paragraph className="text-slate-500">
              List of students who shortlisted this projected will be shown in here, in the order of their preference.
            </Paragraph>
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