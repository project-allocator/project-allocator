import { ProjectCreateWithDetails, ProjectService, ProjectUpdateWithDetails } from "@/api";
import { useMutation, useQuery, useQueryClient } from "react-query";

export function useProjects(approved?: boolean) {
  if (approved === undefined) {
    return useQuery(["projects"], () => ProjectService.readProjects());
  }
  return useQuery(["projects", approved], () => ProjectService.readProjects(approved));
}

export function useProject(id: string) {
  return useQuery(["projects", id], () => ProjectService.readProject(id));
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

export function useSetProjectStatus(id: string) {
  const queryClient = useQueryClient();

  return useMutation(({ approved }: { approved: boolean }) => ProjectService.setProjectStatus(id, { approved }), {
    onMutate: async ({ approved }) => {
      await queryClient.cancelQueries(["projects", id]);
      const oldProject = queryClient.getQueryData(["projects", id]);
      queryClient.setQueryData(["projects", id], { ...(oldProject as any), approved });
      return { oldProject };
    },
    onError: (error, variables, context: any) => {
      queryClient.setQueryData(["projects", id], context.oldProject);
    },
    onSettled: () => {
      queryClient.invalidateQueries(["projects", id]);
    },
  });
}

export function useResetProjectStatus(id: string) {
  const queryClient = useQueryClient();

  return useMutation(() => ProjectService.resetProjectStatus(id), {
    onMutate: async () => {
      await queryClient.cancelQueries(["projects", id]);
      const oldProject = queryClient.getQueryData(["projects", id]);
      queryClient.setQueryData(["projects", id], { ...(oldProject as any), approved: null });
      return { oldProject };
    },
    onError: (error, variables, context: any) => {
      queryClient.setQueryData(["projects", id], context.oldProject);
    },
    onSettled: () => {
      queryClient.invalidateQueries(["projects", id]);
    },
  });
}

export function useProjectDetailTemplates() {
  return useQuery(["projects", "details", "templates"], () => ProjectService.readProjectDetailTemplates());
}

export function useIsProjectAllocated(projectId: string) {
  return useQuery(["projects", projectId, "allocated"], () => ProjectService.isProjectAllocated(projectId));
}

export function useIsProjectAccepted(projectId: string) {
  return useQuery(["projects", projectId, "accepted"], () => ProjectService.isProjectAccepted(projectId));
}
