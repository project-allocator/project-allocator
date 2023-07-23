import { ProjectsTable } from "@/components/ProjectTable";
import { ProjectService } from "@/services/api";

export async function projectsLoader() {
  return await ProjectService.readProjects();
}

export default function Projects() {
  return <ProjectsTable title="List of All Projects" />
}
