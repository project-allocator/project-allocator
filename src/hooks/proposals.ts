import { ProposalService } from "@/api";
import { useQuery } from "@tanstack/react-query";

export function useProposedProjects() {
  return useQuery({
    queryKey: ["projects", "proposed-projects"],
    queryFn: () => ProposalService.readProposedProjects(),
  });
}

export function useProposer(projectId: string) {
  return useQuery({
    queryKey: ["projects", "proposer", projectId],
    queryFn: () => ProposalService.readProposer(projectId),
  });
}
