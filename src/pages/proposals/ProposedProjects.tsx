import ProjectAddButton from "@/components/projects/ProjectAddButton";
import { ProjectTable } from "@/components/projects/ProjectTable";
import { useProposedProjects } from "@/hooks/proposals";
import { useAuth } from "@/hooks/users";
import { Divider, Space, Typography } from "antd";
import { Suspense } from "react";

const { Title } = Typography;

export default function ProposedProjects() {
  const { isAdmin, isStaff } = useAuth();

  const projects = useProposedProjects();

  return (
    <>
      <Space className="flex items-center justify-between my-8">
        <Title level={3} className="my-0">
          Proposed Projects
        </Title>
        {(isStaff || isAdmin) && (
          <Suspense>
            <ProjectAddButton />
          </Suspense>
        )}
      </Space>
      <Divider />
      <ProjectTable projects={projects.data!} />
    </>
  );
}
