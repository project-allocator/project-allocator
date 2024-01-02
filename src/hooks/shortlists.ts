import { ProjectRead, ShortlistService } from "@/api";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import * as _ from "underscore";

export function useShortlisters(projectId: string) {
  return useSuspenseQuery({
    queryKey: ["projects", "shortlisters", projectId],
    queryFn: () => ShortlistService.readShortlisters(projectId),
  });
}

export function useShortlistedProjects() {
  return useSuspenseQuery({
    queryKey: ["projects", "shortlisted-projects"],
    queryFn: () => ShortlistService.readShortlistedProjects(),
  });
}

export function useShortlistProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (project: ProjectRead) => ShortlistService.shortlistProject(project.id),
    onMutate: async (project) => {
      await queryClient.cancelQueries({ queryKey: ["projects", "shortlisted-projects"] });
      const oldShortlistedProjects = queryClient.getQueryData(["projects", "shortlisted-projects"]) as ProjectRead[];
      queryClient.setQueryData(["projects", "shortlisted-projects"], oldShortlistedProjects.concat(project));
      return { oldShortlistedProjects };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(["projects", "shortlisted-projects"], context?.oldShortlistedProjects);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", "shortlisters"] });
      queryClient.invalidateQueries({ queryKey: ["projects", "shortlisted-projects"] });
    },
  });
}

export function useUnshortlistProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => ShortlistService.unshortlistProject(projectId),
    onMutate: async (projectId) => {
      await queryClient.cancelQueries({ queryKey: ["projects", "shortlisted-projects"] });
      const oldShortlistedProjects = queryClient.getQueryData(["projects", "shortlisted-projects"]) as ProjectRead[];
      queryClient.setQueryData(
        ["projects", "shortlisted-projects"],
        oldShortlistedProjects.filter((project) => project.id !== projectId),
      );
      return { oldShortlistedProjects };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(["projects", "shortlisted-projects"], context?.oldShortlistedProjects);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", "shortlisters"] });
      queryClient.invalidateQueries({ queryKey: ["projects", "shortlisted-projects"] });
    },
  });
}

export function useReorderShortlistedProjects() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectIds: string[]) => ShortlistService.reorderShortlistedProjects(projectIds),
    onMutate: async (projectIds) => {
      await queryClient.cancelQueries({ queryKey: ["projects", "shortlisted-projects"] });
      const oldShortlistedProjects = queryClient.getQueryData(["projects", "shortlisted-projects"]) as ProjectRead[];
      queryClient.setQueryData(
        ["projects", "shortlisted-projects"],
        _.sortBy(oldShortlistedProjects, (project) => projectIds.indexOf(project.id)),
      );
      return { oldShortlistedProjects };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(["projects", "shortlisted-projects"], context?.oldShortlistedProjects);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", "shortlisted-projects"] });
    },
  });
}
