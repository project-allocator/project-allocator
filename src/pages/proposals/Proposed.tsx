import { ProjectsTable } from '@/components/ProjectTable';
import { ProposalService } from '@/services/api';

export async function proposedLoader() {
  return await ProposalService.readProjects()
}

export default function Proposed() {
  return <ProjectsTable title="List of Proposed Projects" />
}