import { AllocationService, ProjectRead, ProjectService, ShortlistService, UserRead, UserService } from "@/api";
import { ProjectContent } from "@/components/ProjectContent";
import ProjectHeader from "@/components/ProjectHeader";
import StaffRoute from "@/routes/StaffRoute";
import { getInitialLetters } from "@/utils";
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Avatar, Button, Divider, List, Select, Tooltip, Typography } from "antd";
import { useEffect, useState } from "react";
import { Link, useLoaderData, type LoaderFunctionArgs } from 'react-router-dom';

const { Title, Paragraph, Text } = Typography;

export async function projectLoader({ params }: LoaderFunctionArgs) {
  const id = parseInt(params.id!);
  const project = await ProjectService.readProject(id);
  const students = await UserService.readUsers("student");
  const shortlisters = await ShortlistService.readShortlisters(id);
  const allocatees = await AllocationService.readAllocatees(id);
  return [project, students, shortlisters, allocatees];
}

export default function Project() {
  const [project, students, shortlisters, initialAllocatees]
    = useLoaderData() as [ProjectRead, UserRead[], UserRead[], UserRead[]];

  const [allocatees, setAllocatees] = useState<UserRead[]>(initialAllocatees);
  const [extraAllocateeIndices, setExtraAllocateeIndices] = useState<number[]>([]);

  const [hasConflict, setHasConflict] = useState<boolean | null>(null);
  const updateHasConflict = (allocatees: UserRead[]) =>
    setHasConflict(!allocatees?.every((allocatee) => allocatee.accepted))
  useEffect(() => updateHasConflict(allocatees), []);

  return (
    <>
      <ProjectHeader
        title={`Project ${project.id}`}
        project={project}
        hasConflict={hasConflict}
      />
      <Divider />
      <ProjectContent project={project} />
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
            placeholder="Select students to add"
            value={extraAllocateeIndices}
            options={students.map((student, index) =>
              ({ label: `${student.name} (${student.email})`, value: index }))}
            filterOption={(inputValue, option) => {
              if (!option) return false;
              const target = inputValue.toLowerCase();
              const student = students[option!.value];
              return [student.email, student.name].some((item) => item.toLowerCase().includes(target));
            }}
            onChange={(indices: number[]) => setExtraAllocateeIndices(indices)}
          />
          <Button
            shape="circle"
            className="flex-none"
            icon={<PlusOutlined />}
            onClick={() => {
              const extraAllocatees = extraAllocateeIndices.map((index) => students[index]);
              AllocationService.addAllocatees(project.id, extraAllocatees);
              const newAllocatees = [...extraAllocatees, ...allocatees];
              setAllocatees(newAllocatees);
              updateHasConflict(newAllocatees);
              setExtraAllocateeIndices([]);
            }}
          />
        </div>
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
                    onClick={() => {
                      AllocationService.removeAllocatee(allocatee.id);
                      const newAllocatees = allocatees.filter((item) => item.id !== allocatee.id);
                      setAllocatees(newAllocatees);
                      updateHasConflict(newAllocatees);
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