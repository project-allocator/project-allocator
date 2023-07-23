import { ProjectRead } from "@/services/api";
import { Divider, Input, Space, Table, Tag, Typography } from "antd";
import { useState } from "react";
import Highlighter from 'react-highlight-words';
import { Link, useLoaderData } from "react-router-dom";

const { Title } = Typography;
const { Search } = Input;

interface ProjectsTableProps {
  title: string
}

export function ProjectsTable({ title }: ProjectsTableProps) {
  const projects = useLoaderData() as ProjectRead[];
  const [searchText, setSearchText] = useState('');

  const columns = [
    {
      title: "Title",
      render: (project: ProjectRead) => (
        <Link to={`/projects/${project.id}`}>
          <Highlighter
            searchWords={[searchText]}
            textToHighlight={project.title}
          />
        </Link>
      ),
    },
    {
      title: "Description",
      render: (project: ProjectRead) => (
        <Highlighter
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
      render: (project: ProjectRead) => (
        <Space className="flex-wrap min-w-xl">
          {project.categories.map((category: string) => (
            <Tag key={category}>
              <Highlighter
                searchWords={[searchText]}
                textToHighlight={category}
              />
            </Tag>
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
          onChange={(event) => setSearchText(event.target.value)}
          onSearch={(searchText) => setSearchText(searchText)}
        />
      </Title>
      <Divider />
      <Table
        columns={columns}
        dataSource={
          projects
            .filter((project) => [
              project.title,
              project.description,
              ...project.categories
            ].some((text) => text.includes(searchText)))
            .map((project: ProjectRead) => ({
              ...project,
              key: project.id,
            }))
        }
      />
    </>
  );
}
