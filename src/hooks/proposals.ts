import { ProposalService } from "@/api";
import { useQuery } from "react-query";

export function useProposedProjects() {
  return useQuery(["projects", "proposals"], () => ProposalService.readProposedProjects());
}

export function useIsProjectProposed(projectId: string) {
  return useQuery(["projects", "proposals", projectId], () => ProposalService.isProjectProposed(projectId));
}
