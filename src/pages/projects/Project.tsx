import { AllocationService, ProjectRead, ProjectService, ProposalService, ShortlistService, UserRead, UserService } from "@/api";
import { ProjectView } from "@/components/ProjectView";
import { useMessageContext } from "@/contexts/MessageContext";
import StaffRoute from "@/routes/StaffRoute";
import StudentRoute from "@/routes/StudentRoute";
import { getInitialLetters } from "@/utils";
import { CheckOutlined, DeleteOutlined, EditOutlined, HeartOutlined, PlusOutlined } from '@ant-design/icons';
import { Alert, Avatar, Button, Divider, List, Select, Space, Tooltip, Typography } from "antd";
import { useState } from "react";
import { Link, useLoaderData, useLocation, useNavigate, type LoaderFunctionArgs } from 'react-router-dom';

const { Title, Paragraph, Text } = Typography;

export async function projectLoader({ params }: LoaderFunctionArgs) {
  const id = parseInt(params.id!);
  const project = await ProjectService.readProject(id);
  const isProposed = await ProposalService.isProposed(id);
  const allocatees = await AllocationService.readAllocatees(id);
  const isAllocated = await AllocationService.isAllocated(id);
  const isAccepted = await AllocationService.isAccepted();
  const shortlisters = await ShortlistService.readShortlisters(id);
  const isShortlisted = await ShortlistService.isShortlisted(id);
  const users = await UserService.readUsers();
  return [project, isProposed, allocatees, isAllocated, isAccepted, shortlisters, isShortlisted, users];
}

export default function Project() {
  const [project, isProposed, allocatees, isAllocated, isAccepted, shortlisters, isShortlisted, users]
    = useLoaderData() as [ProjectRead, boolean, UserRead[], boolean, boolean, UserRead[], boolean, UserRead[]];
  // Use isShortlisted in state to show the change immediagely in the UI.
  const [isShortlistedState, setIsShortlistedState] = useState(isShortlisted);
  const [allocateesState, setAllocateesState] = useState(allocatees);
  const [selectedUsers, setSelectedUsers] = useState<UserRead[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { messageSuccess, messageError } = useMessageContext();

  return (
    <>
      <StudentRoute>
        {isAccepted === null
          ? (
            <Alert
              type="info"
              showIcon
              message="You have been allocated to this project."
              description="Please accept or decline this project allocation."
              action={
                <Space direction="vertical">
                  <Button
                    size="small"
                    type="primary"
                    onClick={() => AllocationService.acceptAllocation()
                      .then(() => messageSuccess("Successfully accepted project allocation."))
                      .catch(() => messageError("Failed to accept project allocation."))}
                  >
                    Accept
                  </Button>
                  <Button
                    size="small"
                    onClick={() => AllocationService.acceptAllocation()
                      .then(() => messageSuccess("Successfully declined project allocation."))
                      .catch(() => messageError("Failed to decline project allocation."))}
                  >
                    Decline
                  </Button>
                </Space>
              }
            />
          ) : (
            <Alert
              type="info"
              showIcon
              closable
              message={isAccepted
                ? "You have accepted project allcoation"
                : "You have rejected project allocation"}
              description="Contact your administrators for further information."
            />
          )}
      </StudentRoute>
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
                type={isShortlistedState ? "primary" : "default"}
                onClick={() => {
                  !isShortlistedState
                    ? ShortlistService.setShortlisted(project.id)
                    : ShortlistService.unsetShortlisted(project.id);
                  messageSuccess(isShortlistedState
                    ? "Successfully unshortlisted project."
                    : "Successfully shortlisted project.");
                  setIsShortlistedState(!isShortlistedState);
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
                  onClick={() => {
                    ProjectService.deleteProject(project.id);
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
        <Divider />
        <Title level={4}>Allocated Students</Title>
        <Paragraph className="text-slate-500">
          List of students allocated by the administrator will be shown here.
        </Paragraph>
        <div className="flex gap-x-2 mt-6 mr-2">
          <Select
            mode="multiple"
            allowClear
            className="w-full grow"
            placeholder="Please select"
            filterOption={(inputValue, option) => {
              if (!option) return false;
              const user = users[option!.value];
              return [user.email, user.name].some((item) => item.toLowerCase().includes(inputValue));
            }}
            options={users.map((user, index) =>
              ({ label: `${user.name} (${user.email})`, value: index }))}
            onChange={(indices: number[]) => {
              setSelectedUsers(indices.map((index) => users[index]))
            }}
          />
          <Button
            shape="circle"
            className="flex-none"
            icon={<PlusOutlined />}
            onClick={() => {
              AllocationService.addAllocatees(project.id, selectedUsers);
              setAllocateesState([...selectedUsers, ...allocateesState]);
            }}
          />
        </div>
        <List
          className="mt-4"
          itemLayout="horizontal"
          dataSource={allocateesState}
          renderItem={(allocatee) => (
            <List.Item
              actions={[
                <Tooltip title="Delete">
                  <Button
                    className="border-none"
                    icon={<DeleteOutlined />}
                    onClick={() => {
                      AllocationService.removeAllocatee(allocatee.id);
                      setAllocateesState(allocatees.filter((item) => item.id !== allocatee.id));
                    }}
                  />
                </Tooltip>
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar>{getInitialLetters(allocatee.name)}</Avatar>}
                title={<Link to={`/users/${allocatee.id}`}>{allocatee.name}</Link>}
                description={allocatee.email}
              />
              <Text>
                {allocatee.accepted === null
                  ? "No response"
                  : allocatee.accepted ? "Accepted" : "Declined"}
              </Text>
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
      </StaffRoute>
    </>
  );
}