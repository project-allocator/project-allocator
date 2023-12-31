import ProjectAlert from "@/components/projects/ProjectAlert";
import ProjectDetails from "@/components/projects/ProjectDetails";
import ProjectEditDeleteButtons from "@/components/projects/ProjectEditDeleteButtons";
import ProjectShortlistButton from "@/components/projects/ProjectShortlistButton";
import { useUnallocatedUsers } from "@/hooks/admins";
import { useAddAllocatees, useAllocatees, useRemoveAllocatee } from "@/hooks/allocations";
import { useProject } from "@/hooks/projects";
import { useProposer } from "@/hooks/proposals";
import { useShortlisters } from "@/hooks/shortlists";
import { useCurrentUserRole } from "@/hooks/users";
import Await from "@/pages/Await";
import { getInitialLetters } from "@/utils";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Avatar, Button, Divider, List, Select, Space, Tooltip, Typography } from "antd";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";

const { Title, Paragraph, Text } = Typography;

export default function Project() {
  const { id: projectId } = useParams();
  const project = useProject(projectId!);
  const proposer = useProposer(projectId!);

  const { isAdmin, isStaff, isStudent } = useCurrentUserRole();

  return (
    <>
      <ProjectAlert />
      <Space className="flex items-end justify-between">
        <Title level={3}>Project Overview</Title>
        {isStudent && <ProjectShortlistButton />}
        {(isStaff || isAdmin) && <ProjectEditDeleteButtons />}
      </Space>
      <Divider />
      <Await query={project} errorElement="Failed to load project">
        {(project) => (
          <>
            <Title level={4}>{project.title}</Title>
            <Paragraph>{project.description}</Paragraph>
          </>
        )}
      </Await>
      <Divider />
      <Await query={proposer} errorElement="Failed to load proposer">
        {(proposer) => (
          <>
            <Title level={4}>Proposer</Title>
            <Paragraph>
              <Link to={`/users/${proposer.id}`}>
                {proposer.name} ({proposer.email})
              </Link>
            </Paragraph>
          </>
        )}
      </Await>
      <Divider />
      <Await query={project} errorElement="Failed to load project">
        {(project) => <ProjectDetails project={project} />}
      </Await>
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
      <Await query={allocatees} errorElement="Failed to load allocated students">
        {(allocatees) => (
          <List
            className="mt-4"
            itemLayout="horizontal"
            dataSource={allocatees}
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
                <Text>
                  {allocatee.allocation?.accepted === null
                    ? "No Response"
                    : allocatee.allocation?.accepted
                      ? "Accepted"
                      : "Declined"}
                </Text>
              </List.Item>
            )}
          />
        )}
      </Await>
    </>
  );
}

function ShortlistedStudents() {
  const { id } = useParams();
  const shortlisters = useShortlisters(id!);

  return (
    <>
      <Title level={4}>Shortlisted Students</Title>
      <Paragraph className="text-slate-500">
        List of students who shortlisted this projected will be shown in here, in the order of their preference.
      </Paragraph>
      <Await query={shortlisters} errorElement="Failed to load shortlisted students">
        {(shortlisters) => (
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
        )}
      </Await>
    </>
  );
}
