import ProjectAlert from "@/components/projects/ProjectAlert";
import { ProjectContent } from "@/components/projects/ProjectContent";
import ProjectEditDeleteButtons from "@/components/projects/ProjectEditDeleteButtons";
import ProjectShortlistButton from "@/components/projects/ProjectShortlistButton";
import { useUnallocatedUsers } from "@/hooks/admins";
import { useAddAllocatees, useAllocatees, useRemoveAllocatee } from "@/hooks/allocations";
import { useProject } from "@/hooks/projects";
import { useShortlisters } from "@/hooks/shortlists";
import { useCurrentUserRole } from "@/hooks/users";
import Loading from "@/pages/Loading";
import { getInitialLetters } from "@/utils";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Avatar, Button, Divider, List, Select, Space, Tooltip, Typography } from "antd";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";

const { Title, Paragraph, Text } = Typography;

export default function Project() {
  const { isAdmin, isStaff, isStudent } = useCurrentUserRole();

  const { id } = useParams();
  const project = useProject(id!);

  if (project.isLoading) return <Loading />;
  if (project.isError) return null;

  return (
    <>
      <ProjectAlert />
      <Space className="flex items-end justify-between">
        <Title level={3}>Project</Title>
        {isStudent && <ProjectShortlistButton />}
        {(isStaff || isAdmin) && <ProjectEditDeleteButtons />}
      </Space>
      <Divider />
      <ProjectContent project={project.data!} />
      {isAdmin && (
        <>
          <Divider />
          <AllocatedStudents />
        </>
      )}
      {(isStaff || isAdmin) && (
        <>
          <Divider />
          <ShortlistedStudents />
        </>
      )}
    </>
  );
}

function AllocatedStudents() {
  const { id: projectId } = useParams();

  const allocatees = useAllocatees(projectId!);
  const unallocatedUsers = useUnallocatedUsers();
  const addAllocatees = useAddAllocatees(projectId!);
  const removeAllocatee = useRemoveAllocatee(projectId!);

  const [extraAllocateeIndices, setExtraAllocateeIndices] = useState<number[]>([]);

  if (allocatees.isLoading) return <Loading />;
  if (allocatees.isError) return null;

  return (
    <>
      <Title level={4}>Allocated Students</Title>
      <Paragraph className="text-slate-500">
        List of students allocated by the administrator will be shown here.
      </Paragraph>
      <div className="flex gap-x-2 mt-6 mr-2">
        <Select
          mode="multiple"
          allowClear
          className="w-full grow"
          placeholder="Select students to add"
          value={extraAllocateeIndices}
          options={unallocatedUsers.data?.map((student, index) => ({
            label: `${student.name} (${student.email})`,
            value: index,
          }))}
          filterOption={(inputValue, option) => {
            if (!unallocatedUsers.data || !option) return false;
            const target = inputValue.toLowerCase();
            const student = unallocatedUsers.data[option!.value];
            return [student.email, student.name].some((item) => item.toLowerCase().includes(target));
          }}
          onChange={(indices) => setExtraAllocateeIndices(indices)}
        />
        <Button
          shape="circle"
          className="flex-none"
          icon={<PlusOutlined />}
          onClick={() => {
            if (!unallocatedUsers.data) return;
            const extraAllocatees = extraAllocateeIndices.map((index) => unallocatedUsers.data[index]);
            addAllocatees.mutate(extraAllocatees);
            setExtraAllocateeIndices([]);
          }}
        />
      </div>
      <List
        className="mt-4"
        itemLayout="horizontal"
        dataSource={allocatees.data}
        renderItem={(allocatee) => (
          <List.Item
            actions={[
              <Tooltip title="Delete">
                <Button
                  className="border-none"
                  icon={<DeleteOutlined />}
                  onClick={() => removeAllocatee.mutate(allocatee.id)}
                />
              </Tooltip>,
            ]}
          >
            <List.Item.Meta
              avatar={<Avatar>{getInitialLetters(allocatee.name)}</Avatar>}
              title={<Link to={`/users/${allocatee.id}`}>{allocatee.name}</Link>}
              description={allocatee.email}
            />
            <Text>{allocatee.accepted === null ? "No Response" : allocatee.accepted ? "Accepted" : "Declined"}</Text>
          </List.Item>
        )}
      />
    </>
  );
}

function ShortlistedStudents() {
  const { id } = useParams();
  const shortlisters = useShortlisters(id!);

  if (shortlisters.isLoading) return <Loading />;
  if (shortlisters.isError) return null;

  return (
    <>
      <Title level={4}>Shortlisted Students</Title>
      <Paragraph className="text-slate-500">
        List of students who shortlisted this projected will be shown in here, in the order of their preference.
      </Paragraph>
      <List
        className="mt-4"
        itemLayout="horizontal"
        dataSource={shortlisters.data}
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
  );
}
