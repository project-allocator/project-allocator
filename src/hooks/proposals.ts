import { ProposalService } from "@/api";
import { useQuery } from "react-query";

export function useProposedProjects() {
  return useQuery(["projects", "proposed-projects"], () => ProposalService.readProposedProjects());
}

export function useProposer(projectId: string) {
  return useQuery(["projects", "proposer", projectId], () => ProposalService.readProposer(projectId));
}
