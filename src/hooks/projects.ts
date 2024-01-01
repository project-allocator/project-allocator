import { ProjectCreateWithDetails, ProjectRead, ProjectService, ProjectUpdateWithDetails } from "@/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useProjectDetailTemplates() {
  return useQuery({
    queryKey: ["projects", "details", "templates"],
    queryFn: () => ProjectService.readProjectDetailTemplates(),
  });
}

export function useApprovedProjects() {
  return useQuery({ queryKey: ["projects", "approved"], queryFn: () => ProjectService.readApprovedProjects() });
}

export function useDisapprovedProjects() {
  return useQuery({ queryKey: ["projects", "disapproved"], queryFn: () => ProjectService.readDisapprovedProjects() });
}

export function useNoResponseProjects() {
  return useQuery({ queryKey: ["projects", "no-response"], queryFn: () => ProjectService.readNoResponseProjects() });
}

export function useProject(projectId: string) {
  return useQuery({ queryKey: ["projects", projectId], queryFn: () => ProjectService.readProject(projectId) });
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
    onError: (error, variables, context) => {
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
    onError: (error, variables, context) => {
      queryClient.setQueryData(["projects", projectId], context?.oldProject);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
    },
  });
}
