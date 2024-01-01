import ProjectAlert from "@/components/projects/ProjectAlert";
import ProjectDetails from "@/components/projects/ProjectDetails";
import ProjectEditDeleteButtons from "@/components/projects/ProjectEditDeleteButtons";
import ProjectShortlistButton from "@/components/projects/ProjectShortlistButton";
import { useUnallocatedUsers } from "@/hooks/admins";
import { useAddAllocatees, useAllocatees, useRemoveAllocatee } from "@/hooks/allocations";
import { useProject } from "@/hooks/projects";
import { useProposer } from "@/hooks/proposals";
import { useShortlisters } from "@/hooks/shortlists";
import { useAuth } from "@/hooks/users";
import { toInitialLetters } from "@/utils";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Avatar, Button, Divider, List, Select, Skeleton, Space, Tooltip, Typography } from "antd";
import { Suspense, useState } from "react";
import { Link, useParams } from "react-router-dom";

const { Title, Paragraph, Text } = Typography;

export default function Project() {
  const { id: projectId } = useParams();
  const project = useProject(projectId!);

  const { isAdmin, isStaff, isStudent } = useAuth();

  return (
    <>
      <Suspense>
        <ProjectAlert />
      </Suspense>
      <Space className="flex items-center justify-between my-8">
        <Title level={3} className="my-0">
          Project Overview
        </Title>
        {isStudent && (
          <Suspense>
            <ProjectShortlistButton />
          </Suspense>
        )}
        {(isStaff || isAdmin) && (
          <Suspense>
            <ProjectEditDeleteButtons />
          </Suspense>
        )}
      </Space>
      <Divider />
      <Title level={4}>{project.data!.title}</Title>
      <Paragraph>{project.data!.description}</Paragraph>
      <Divider />
      <Suspense fallback={<Skeleton active />}>
        <Proposer />
      </Suspense>
      <Divider />
      <Suspense fallback={<Skeleton active />}>
        <ProjectDetails project={project.data!} />
      </Suspense>
      {isAdmin && (
        <Suspense fallback={<Skeleton active />}>
          <Divider />
          <AllocatedStudentList />
        </Suspense>
      )}
      {(isStaff || isAdmin) && (
        <Suspense fallback={<Skeleton active />}>
          <Divider />
          <ShortlistedStudentList />
        </Suspense>
      )}
    </>
  );
}

function Proposer() {
  const { id: projectId } = useParams();
  const proposer = useProposer(projectId!);

  return (
    <>
      <Title level={4}>Proposer</Title>
      <Paragraph>
        <Link to={`/users/${proposer.data!.id}`}>
          {proposer.data!.name} ({proposer.data!.email})
        </Link>
      </Paragraph>
    </>
  );
}

function AllocatedStudentList() {
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
      <List
        className="mt-4"
        itemLayout="horizontal"
        dataSource={allocatees.data!}
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
              avatar={<Avatar>{toInitialLetters(allocatee.name)}</Avatar>}
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
    </>
  );
}

function ShortlistedStudentList() {
  const { id } = useParams();
  const shortlisters = useShortlisters(id!);

  return (
    <>
      <Title level={4}>Shortlisted Students</Title>
      <Paragraph className="text-slate-500">
        List of students who shortlisted this projected will be shown in here, in the order of their preference.
      </Paragraph>
      <List
        className="mt-4"
        itemLayout="horizontal"
        dataSource={shortlisters.data!}
        renderItem={(shortlister) => (
          <List.Item>
            <List.Item.Meta
              avatar={<Avatar>{toInitialLetters(shortlister.name)}</Avatar>}
              title={<Link to={`/users/${shortlister.id}`}>{shortlister.name}</Link>}
              description={shortlister.email}
            />
          </List.Item>
        )}
      />
    </>
  );
}
