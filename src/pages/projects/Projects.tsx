import { ProjectService } from "@/api";
import { ProjectsTable } from "@/components/ProjectTable";

export async function projectsLoader() {
  return await ProjectService.readProjects();
}

export default function Projects() {
  return <ProjectsTable title="List of All Projects" />
}
