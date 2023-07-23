import client from '@/services/api';
import { ProjectsTable } from './Projects';

export async function proposedLoader() {
  const { data } = await client.get('/users/me/proposed');
  return data;
}

export default function Proposed() {
  return <ProjectsTable title="List of Proposed Projects" />
}