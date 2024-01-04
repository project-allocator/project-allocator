import { ProjectRead, ProjectReadWithProposal } from "@/api";
import { usePrefetchProject } from "@/hooks/projects";
import { usePrefetchUser } from "@/hooks/users";
import { Input, Table } from "antd";
import { useState } from "react";
import Highlighter from "react-highlight-words";
import { Link } from "react-router-dom";

const { Search } = Input;

export function ProjectTable({ projects }: { projects: ProjectReadWithProposal[] }) {
  const [searchText, setSearchText] = useState("");

  // Prefetch project and proposer data when hovering over an item
  const prefetchProject = usePrefetchProject();
  const prefetchUser = usePrefetchUser();

  const columns = [
    {
      title: "Title",
      render: (project: ProjectReadWithProposal) => (
        <Link to={`/projects/${project.id}`} onMouseOver={() => prefetchProject(project.id)}>
          <Highlighter searchWords={[searchText]} textToHighlight={project.title} />
        </Link>
      ),
    },
    {
      title: "Description",
      render: (project: ProjectReadWithProposal) => (
        <Highlighter
          searchWords={[searchText]}
          textToHighlight={
            project.description.length < 500 ? project.description : project.description.slice(0, 500) + "..."
          }
        />
      ),
    },
    {
      title: "Proposer",
      render: (project: ProjectReadWithProposal) => (
        <Link
          to={`/users/${project.proposal.proposer.id}`}
          onMouseOver={() => prefetchUser(project.proposal.proposer.id)}
        >
          <Highlighter searchWords={[searchText]} textToHighlight={project.proposal.proposer.name} />
        </Link>
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
          .filter((project) =>
            (project.title + project.description + project.proposal.proposer.name)
              .toLowerCase()
              .includes(searchText.toLowerCase()),
          )
          .map((project: ProjectRead) => ({ key: project.id, ...project }))}
      />
    </>
  );
}
