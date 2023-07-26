import { ProposalService } from '@/api';
import { ProjectsTable } from '@/components/ProjectTable';

export async function proposedLoader() {
  return await ProposalService.readProjects()
}

export default function Proposed() {
  return <ProjectsTable title="List of Proposed Projects" />
}