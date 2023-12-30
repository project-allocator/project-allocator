import { ShortlistService } from "@/api";
import { useMutation, useQuery, useQueryClient } from "react-query";
import * as _ from "underscore";

export function useShortlisters(projectId: string) {
  return useQuery(["projects", "shortlisters", projectId], () => ShortlistService.readShortlisters(projectId));
}

export function useShortlistedProjects() {
  return useQuery(["projects", "shortlisted"], () => ShortlistService.readShortlistedProjects());
}

export function useShortlistProject(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation(() => ShortlistService.shortlistProject(projectId), {
    onMutate: async () => {
      await queryClient.cancelQueries(["projects", "shortlisted"]);
      queryClient.setQueryData(["projects", "shortlisted", projectId], true);
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(["projects", "shortlisted", projectId], false);
    },
    onSettled: () => {
      queryClient.invalidateQueries(["projects", "shortlisters"]);
      queryClient.invalidateQueries(["projects", "shortlisted"]);
    },
  });
}

export function useUnshortlistProject(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation(() => ShortlistService.unshortlistProject(projectId), {
    onMutate: async () => {
      await queryClient.cancelQueries(["projects", "shortlisted"]);
      queryClient.setQueryData(["projects", "shortlisted", projectId], false);
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(["projects", "shortlisted", projectId], true);
    },
    onSettled: () => {
      queryClient.invalidateQueries(["projects", "shortlisters"]);
      queryClient.invalidateQueries(["projects", "shortlisted"]);
    },
  });
}

export function useReorderShortlistedProjects() {
  const queryClient = useQueryClient();

  return useMutation((projectIds: string[]) => ShortlistService.reorderShortlistedProjects(projectIds), {
    onMutate: async (projectIds) => {
      await queryClient.cancelQueries(["projects", "shortlisted"]);
      const oldShortlistedProjects = queryClient.getQueryData(["projects", "shortlisted"]);
      queryClient.setQueryData(
        ["projects", "shortlisted"],
        _.sortBy(oldShortlistedProjects as any[], (project) => projectIds.indexOf(project.id))
      );
      return { oldShortlistedProjects };
    },
    onError: (error, variables, context: any) => {
      queryClient.setQueryData(["projects", "shortlisted"], context.oldShortlistedProjects);
    },
    onSettled: () => {
      queryClient.invalidateQueries(["projects", "shortlisted"]);
    },
  });
}
