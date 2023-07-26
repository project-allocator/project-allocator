import { ProjectRead } from "@/api";
import { Input, Space, Table, Tag } from "antd";
import { useState } from "react";
import Highlighter from 'react-highlight-words';
import { Link, useLoaderData } from "react-router-dom";

const { Search } = Input;

export function ProjectsTable() {
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
      <Search
        className="w-64 mb-4"
        placeholder="Enter search text"
        onChange={(event) => setSearchText(event.target.value)}
        onSearch={(searchText) => setSearchText(searchText)}
      />
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
