import { ProjectCreateWithDetails, ProjectRead, ProjectService, ProjectUpdateWithDetails } from "@/api";
import { useMutation, useQuery, useQueryClient } from "react-query";

export function useProjectDetailTemplates() {
  return useQuery(["projects", "details", "templates"], () => ProjectService.readProjectDetailTemplates());
}

export function useApprovedProjects() {
  return useQuery(["projects", "approved"], () => ProjectService.readApprovedProjects());
}

export function useDisapprovedProjects() {
  return useQuery(["projects", "disapproved"], () => ProjectService.readDisapprovedProjects());
}

export function useNoResponseProjects() {
  return useQuery(["projects", "no-response"], () => ProjectService.readNoResponseProjects());
}

export function useProject(projectId: string) {
  return useQuery(["projects", projectId], () => ProjectService.readProject(projectId));
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation((project: ProjectCreateWithDetails) => ProjectService.createProject(project), {
    onSuccess: () => {
      queryClient.invalidateQueries(["projects"]);
    },
  });
}

export function useUpdateProject(id: string) {
  const queryClient = useQueryClient();

  return useMutation((project: ProjectUpdateWithDetails) => ProjectService.updateProject(id, project), {
    onSuccess: () => {
      queryClient.invalidateQueries(["projects"]);
    },
  });
}

export function useDeleteProject(id: string) {
  const queryClient = useQueryClient();

  return useMutation(() => ProjectService.deleteProject(id), {
    onSuccess: () => {
      queryClient.invalidateQueries(["projects"]);
    },
  });
}

export function useApproveProject(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation(() => ProjectService.approveProject(projectId), {
    onMutate: async () => {
      await queryClient.cancelQueries(["projects", projectId]);
      const oldProject = queryClient.getQueryData(["projects", projectId]) as ProjectRead;
      queryClient.setQueryData(["projects", projectId], { ...oldProject, approved: true });
      return { oldProject };
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(["projects", projectId], context?.oldProject);
    },
    onSettled: () => {
      queryClient.invalidateQueries(["projects", projectId]);
    },
  });
}

export function useDisapproveProject(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation(() => ProjectService.disapproveProject(projectId), {
    onMutate: async () => {
      await queryClient.cancelQueries(["projects", projectId]);
      const oldProject = queryClient.getQueryData(["projects", projectId]) as ProjectRead;
      queryClient.setQueryData(["projects", projectId], { ...oldProject, approved: false });
      return { oldProject };
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(["projects", projectId], context?.oldProject);
    },
    onSettled: () => {
      queryClient.invalidateQueries(["projects", projectId]);
    },
  });
}
