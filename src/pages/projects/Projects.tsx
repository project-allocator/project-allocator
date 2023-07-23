import client from "@/services/api";
import type { Project } from "@/types";
import { Divider, Input, Space, Table, Tag, Typography } from "antd";
import { useState } from "react";
import Highlighter from 'react-highlight-words';
import { Link, useLoaderData } from "react-router-dom";

const { Title } = Typography;
const { Search } = Input;

export async function projectsLoader() {
  const { data } = await client.get('/projects');
  return data;
}

export default function Projects() {
  return <ProjectsTable title="List of All Projects" />
}

interface ProjectsTableProps {
  title: string
}

export function ProjectsTable({ title }: ProjectsTableProps) {
  const projects = useLoaderData() as Project[];
  const [searchText, setSearchText] = useState('');

  const columns = [
    {
      title: "Title",
      render: (project: Project) => (
        <Link to={`/projects/${project.id}`}>
          <Highlighter
            highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
            searchWords={[searchText]}
            textToHighlight={project.title}
          />
        </Link>
      ),
    },
    {
      title: "Description",
      render: (project: Project) => (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          textToHighlight={
            project.description.length < 500
              ? project.description
              : project.description.slice(0, 500) + "..."
          }
        />
      ),
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

  return (
    <>
      <Title level={3} className="flex justify-between items-center">
        {title}
        <Search
          className="w-64"
          placeholder="Enter search text"
          onSearch={(searchText) => setSearchText(searchText)}
        />
      </Title>
      <Divider />
      <Table
        columns={columns}
        dataSource={
          projects
            .filter((project) => project.title.includes(searchText) || project.description.includes(searchText))
            .map((project: Project) => ({
              ...project,
              key: project.id,
            }))
        }
      />
    </>
  );
}
