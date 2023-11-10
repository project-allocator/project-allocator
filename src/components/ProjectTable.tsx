import { ProjectRead } from "@/api";
import { AutoComplete, Input, Space, Table, Tag } from "antd";
import { useState } from "react";
import Highlighter from "react-highlight-words";
import { Link } from "react-router-dom";

interface ProjectsTableProps {
  projects: ProjectRead[];
}

export function ProjectsTable({ projects }: ProjectsTableProps) {
  const [searchText, setSearchText] = useState("");

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
      <AutoComplete
        className="w-64 mb-4"
        options={projects
          .map((project) => project.categories)
          .flat()
          .filter((option) =>
            option.toLowerCase().includes(searchText.toLowerCase()),
          )
          .map((option) => ({ value: option }))}
        value={searchText}
        onChange={(searchText) => setSearchText(searchText)}
        onSearch={(searchText) => setSearchText(searchText)}
      >
        <Input.Search placeholder="Enter search text" />
      </AutoComplete>
      <Table
        columns={columns}
        dataSource={projects
          .filter((project) =>
            [project.title, project.description, ...project.categories].some(
              (text) => text.toLowerCase().includes(searchText.toLowerCase()),
            ),
          )
          .map((project: ProjectRead) => ({
            ...project,
            key: project.id,
          }))}
      />
    </>
  );
}
