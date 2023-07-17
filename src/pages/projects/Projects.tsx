import Loading from "@/components/Loading";
import MessageContext from "@/contexts/message";
import { getData } from "@/services/client";
import { Project } from "@/services/projects";
import { showErrorMessage } from "@/utils";
import { HeartOutlined } from "@ant-design/icons";
import { Button, Divider, Space, Table, Tag, Tooltip, Typography } from "antd";
import { useContext } from "react";

const { Title } = Typography;

const columns = [
  {
    title: "Title",
    render: (project: Project) => (
      <a href={`/projects/${project.id}`}>{project.title}</a>
    ),
  },
  {
    title: "Description",
    render: (project: Project) => project.description.slice(0, 500) + "...",
  },
  {
    title: "Categories",
    render: (project: Project) => (
      <Space className="flex-wrap min-w-xl">
        {project.categories.map((category: string) => (
          <Tag key={category}>{category}</Tag>
        ))}
      </Space>
    ),
  },
];

export default function AllProjects() {
  // Call the internal Graph QL API
  const { data, loading, error } = getData();

  const message = useContext(MessageContext)!;
  if (loading) return <Loading />;
  if (error) showErrorMessage(message, error);

  const projects = data!.projects?.map((project: Project) => ({
    ...project,
    key: project.id,
  }));

  return (
    <>
      <Title level={3} className="flex justify-between items-center">
        List of All Projects
        <Tooltip title="Shortlist">
          <Button shape="circle" icon={<HeartOutlined />} />
        </Tooltip>
      </Title>
      <Divider />
      <Table
        rowSelection={{ type: "checkbox" }}
        columns={columns}
        dataSource={projects}
      />
    </>
  );
}
