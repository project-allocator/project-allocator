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
    mutationFn: ({ templateId, template }: { templateId: string; template: ProjectDetailTemplateRead }) =>
      ProjectService.updateProjectDetailTemplate(templateId, template),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", "details", "templates"] });
    },
  });
}

export function useDeleteProjectDetailTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (templateId: string) => ProjectService.deleteProjectDetailTemplate(templateId),
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

export function useNonApprovedProjects() {
  return useSuspenseQuery({
    queryKey: ["projects", "no-response"],
    queryFn: () => ProjectService.readNonApprovedProjects(),
  });
}

export function useProject(projectId: string) {
  return useSuspenseQuery({ queryKey: ["projects", projectId], queryFn: () => ProjectService.readProject(projectId) });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ templateIds, project }: { templateIds: string[]; project: ProjectCreateWithDetails }) =>
      ProjectService.createProject({ template_ids: templateIds, project_data: project }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useUpdateProject(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ templateIds, project }: { templateIds: string[]; project: ProjectUpdateWithDetails }) =>
      ProjectService.updateProject(id, { template_ids: templateIds, project_data: project }),
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
