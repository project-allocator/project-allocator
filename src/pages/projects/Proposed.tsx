import { ProposalService } from '@/services/api';
import { ProjectsTable } from './Projects';

export async function proposedLoader() {
  return await ProposalService.readProjects()
}

export default function Proposed() {
  return <ProjectsTable title="List of Proposed Projects" />
}