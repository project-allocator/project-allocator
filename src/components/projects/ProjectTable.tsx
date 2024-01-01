import { ProjectRead, ProjectService, ProposalService } from "@/api";
import { useQueryClient } from "@tanstack/react-query";
import { Input, Table } from "antd";
import { useState } from "react";
import Highlighter from "react-highlight-words";
import { Link } from "react-router-dom";

const { Search } = Input;

export function ProjectTable({ projects }: { projects: ProjectRead[] }) {
  const [searchText, setSearchText] = useState("");

  // Rendering Project component involves a lot of API requests
  // so we should prefetch some data beforehand.
  const queryClient = useQueryClient();
  function prefetchProject(projectId: string) {
    queryClient.prefetchQuery({
      queryKey: ["projects", "details", "templates"],
      queryFn: () => ProjectService.readProjectDetailTemplates(),
    });
    queryClient.prefetchQuery({
      queryKey: ["projects", projectId],
      queryFn: () => ProjectService.readProject(projectId),
    });
    queryClient.prefetchQuery({
      queryKey: ["projects", "proposer", projectId],
      queryFn: () => ProposalService.readProposer(projectId),
    });
  }

  const columns = [
    {
      title: "Title",
      render: (project: ProjectRead) => (
        <Link to={`/projects/${project.id}`} onMouseOver={() => prefetchProject(project.id)}>
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
