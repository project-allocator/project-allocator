import { ProjectRead, ShortlistService } from "@/api";
import { useMutation, useQuery, useQueryClient } from "react-query";
import * as _ from "underscore";

export function useShortlisters(projectId: string) {
  return useQuery(["projects", "shortlisters", projectId], () => ShortlistService.readShortlisters(projectId));
}

export function useShortlistedProjects() {
  return useQuery(["projects", "shortlisted-projects"], () => ShortlistService.readShortlistedProjects());
}

export function useShortlistProject() {
  const queryClient = useQueryClient();

  return useMutation((project: ProjectRead) => ShortlistService.shortlistProject(project.id), {
    onMutate: async (project) => {
      await queryClient.cancelQueries(["projects", "shortlisted-projects"]);
      const oldShortlistedProjects = queryClient.getQueryData(["projects", "shortlisted-projects"]) as ProjectRead[];
      queryClient.setQueryData(["projects", "shortlisted-projects"], oldShortlistedProjects.concat(project));
      return { oldShortlistedProjects };
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(["projects", "shortlisted-projects"], context?.oldShortlistedProjects);
    },
    onSettled: () => {
      queryClient.invalidateQueries(["projects", "shortlisters"]);
      queryClient.invalidateQueries(["projects", "shortlisted-projects"]);
    },
  });
}

export function useUnshortlistProject() {
  const queryClient = useQueryClient();

  return useMutation((projectId: string) => ShortlistService.unshortlistProject(projectId), {
    onMutate: async (projectId) => {
      await queryClient.cancelQueries(["projects", "shortlisted-projects"]);
      const oldShortlistedProjects = queryClient.getQueryData(["projects", "shortlisted-projects"]) as ProjectRead[];
      queryClient.setQueryData(
        ["projects", "shortlisted-projects"],
        oldShortlistedProjects.filter((project) => project.id !== projectId)
      );
      return { oldShortlistedProjects };
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(["projects", "shortlisted-projects"], context?.oldShortlistedProjects);
    },
    onSettled: () => {
      queryClient.invalidateQueries(["projects", "shortlisters"]);
      queryClient.invalidateQueries(["projects", "shortlisted-projects"]);
    },
  });
}

export function useReorderShortlistedProjects() {
  const queryClient = useQueryClient();

  return useMutation((projectIds: string[]) => ShortlistService.reorderShortlistedProjects(projectIds), {
    onMutate: async (projectIds) => {
      await queryClient.cancelQueries(["projects", "shortlisted-projects"]);
      const oldShortlistedProjects = queryClient.getQueryData(["projects", "shortlisted-projects"]) as ProjectRead[];
      queryClient.setQueryData(
        ["projects", "shortlisted-projects"],
        _.sortBy(oldShortlistedProjects, (project) => projectIds.indexOf(project.id))
      );
      return { oldShortlistedProjects };
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(["projects", "shortlisted-projects"], context?.oldShortlistedProjects);
    },
    onSettled: () => {
      queryClient.invalidateQueries(["projects", "shortlisted-projects"]);
    },
  });
}
