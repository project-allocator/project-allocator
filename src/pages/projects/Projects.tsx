import client from "@/services/api";
import type { Project } from "@/types";
import { Divider, Table, Typography } from "antd";
import { useLoaderData } from "react-router-dom";

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
    render: (project: Project) => project.description.length < 500
      ? project.description
      : project.description.slice(0, 500) + "...",
  },
  // TODO: Bring back categories view
  // {
  //   title: "Categories",
  //   render: (project: ProjectRead) => (
  //     <Space className="flex-wrap min-w-xl">
  //       {project.categories.map((category: string) => (
  //         <Tag key={category}>{category}</Tag>
  //       ))}
  //     </Space>
  //   ),
  // },
];

export async function loader() {
  const { data } = await client.get('/projects');
  return data;
}

export default function Projects() {
  const projects = useLoaderData() as Project[];

  return (
    <>
      <Title level={3}>
        List of All Projects
      </Title>
      <Divider />
      <Table
        rowSelection={{ type: "checkbox" }}
        columns={columns}
        dataSource={
          projects.map((project: Project) => ({
            ...project,
            key: project.id,
          }))
        }
      />
    </>
  );
}
