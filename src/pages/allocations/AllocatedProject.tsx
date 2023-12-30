import { AllocationService } from "@/api";
import ProjectAlert from "@/components/projects/ProjectAlert";
import { ProjectContent } from "@/components/projects/ProjectContent";
import ProjectEditDeleteButtons from "@/components/projects/ProjectEditDeleteButtons";
import ProjectShortlistButton from "@/components/projects/ProjectShortlistButton";
import { useAllocatedProject } from "@/hooks/allocations";
import { useCurrentUserRole } from "@/hooks/users";
import { Divider, Empty, Space, Typography } from "antd";

const { Title } = Typography;

export async function allocatedProjectLoader() {
  return await AllocationService.readAllocated();
}

export default function AllocatedProject() {
  const project = useAllocatedProject();
  const { isAdmin, isStaff, isStudent } = useCurrentUserRole();

  return (
    <>
      <ProjectAlert />
      <Space className="flex items-end justify-between">
        <Title level={3}>Project</Title>
        {isStudent && <ProjectShortlistButton />}
        {(isStaff || isAdmin) && <ProjectEditDeleteButtons />}
      </Space>
      <Divider />
      {project.data ? <ProjectContent project={project.data!} /> : <Empty />}
    </>
  );
}
