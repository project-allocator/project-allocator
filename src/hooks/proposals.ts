import { ProposalService } from "@/api";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useProposedProjects() {
  return useSuspenseQuery({
    queryKey: ["projects", "proposed-projects"],
    queryFn: () => ProposalService.readProposedProjects(),
  });
}

export function useProposer(projectId: string) {
  return useSuspenseQuery({
    queryKey: ["projects", "proposer", projectId],
    queryFn: () => ProposalService.readProposer(projectId),
  });
}
