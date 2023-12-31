import { ProjectRead } from "@/api";
import { Input, Table } from "antd";
import { useState } from "react";
import Highlighter from "react-highlight-words";
import { Link } from "react-router-dom";

const { Search } = Input;

export function ProjectTable({ projects }: { projects: ProjectRead[] }) {
  const [searchText, setSearchText] = useState("");

  const columns = [
    {
      title: "Title",
      render: (project: ProjectRead) => (
        <Link to={`/projects/${project.id}`}>
          <Highlighter searchWords={[searchText]} textToHighlight={project.title} />
        </Link>
      ),
    },
    {
      title: "Description",
      render: (project: ProjectRead) => (
        <Highlighter
          searchWords={[searchText]}
          textToHighlight={
            project.description.length < 500 ? project.description : project.description.slice(0, 500) + "..."
          }
        />
      ),
    },
  ];

  return (
    <>
      <Search
        className="w-64 mb-4"
        placeholder="Enter search text"
        value={searchText}
        allowClear
        onChange={(event) => setSearchText(event.target.value)}
        onSearch={(value) => setSearchText(value)}
      />
      <Table
        columns={columns}
        dataSource={projects
          .filter((project) => (project.title + project.description).toLowerCase().includes(searchText.toLowerCase()))
          .map((project: ProjectRead) => ({ key: project.id, ...project }))}
      />
    </>
  );
}
