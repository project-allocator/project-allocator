import {
  ProjectCreateWithDetails,
  ProjectDetailTemplateCreate,
  ProjectDetailTemplateRead,
  ProjectRead,
  ProjectService,
  ProjectUpdateWithDetails,
  ProposalService,
} from "@/api";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";

export function useProjectDetailTemplates() {
  return useSuspenseQuery({
    queryKey: ["projects", "details", "templates"],
    queryFn: () => ProjectService.readProjectDetailTemplates(),
  });
}

export function useCreateProjectDetailTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (template: ProjectDetailTemplateCreate) => ProjectService.createProjectDetailTemplate(template),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", "details", "templates"] });
    },
  });
}

export function useUpdateProjectDetailTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ key, template }: { key: string; template: ProjectDetailTemplateRead }) =>
      ProjectService.updateProjectDetailTemplate(key, template),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", "details", "templates"] });
    },
  });
}

export function useDeleteProjectDetailTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (key: string) => ProjectService.deleteProjectDetailTemplate(key),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", "details", "templates"] });
    },
  });
}

export function useApprovedProjects() {
  return useSuspenseQuery({ queryKey: ["projects", "approved"], queryFn: () => ProjectService.readApprovedProjects() });
}

export function useDisapprovedProjects() {
  return useSuspenseQuery({
    queryKey: ["projects", "disapproved"],
    queryFn: () => ProjectService.readDisapprovedProjects(),
  });
}

export function useNoResponseProjects() {
  return useSuspenseQuery({
    queryKey: ["projects", "no-response"],
    queryFn: () => ProjectService.readNoResponseProjects(),
  });
}

export function useProject(projectId: string) {
  return useSuspenseQuery({ queryKey: ["projects", projectId], queryFn: () => ProjectService.readProject(projectId) });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (project: ProjectCreateWithDetails) => ProjectService.createProject(project),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useUpdateProject(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (project: ProjectUpdateWithDetails) => ProjectService.updateProject(id, project),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useDeleteProject(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => ProjectService.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useApproveProject(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => ProjectService.approveProject(projectId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["projects", projectId] });
      const oldProject = queryClient.getQueryData(["projects", projectId]) as ProjectRead;
      queryClient.setQueryData(["projects", projectId], { ...oldProject, approved: true });
      return { oldProject };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(["projects", projectId], context?.oldProject);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
    },
  });
}

export function useDisapproveProject(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => ProjectService.disapproveProject(projectId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["projects", projectId] });
      const oldProject = queryClient.getQueryData(["projects", projectId]) as ProjectRead;
      queryClient.setQueryData(["projects", projectId], { ...oldProject, approved: false });
      return { oldProject };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(["projects", projectId], context?.oldProject);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
    },
  });
}

export function usePrefetchProject() {
  const queryClient = useQueryClient();

  return (projectId: string) => {
    queryClient.prefetchQuery({
      queryKey: ["projects", "details", "templates"],
      queryFn: () => ProjectService.readProjectDetailTemplates(),
    });
    queryClient.prefetchQuery({
      queryKey: ["projects", projectId],
      queryFn: () => ProjectService.readProject(projectId),
    });
    queryClient.prefetchQuery({
      queryKey: ["projects", "proposer", projectId],
      queryFn: () => ProposalService.readProposer(projectId),
    });
  };
}
