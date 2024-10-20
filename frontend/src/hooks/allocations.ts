import { AllocationService, ProjectReadWithAllocations, UserRead } from "@/api";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";

export function useAllocatedProject() {
  return useSuspenseQuery({
    queryKey: ["projects", "allocated-project"],
    queryFn: () =>
      AllocationService.readAllocatedProject().catch((error) => {
        if (error.status === 404) return Promise.resolve(null);
        return Promise.reject(error);
      }),
  });
}

export function useAllocatees(projectId: string) {
  return useSuspenseQuery({
    queryKey: ["projects", "allocatees", projectId],
    queryFn: () => AllocationService.readAllocatees(projectId),
  });
}

export function useNonAllocatees() {
  return useSuspenseQuery({
    queryKey: ["projects", "non-allocatees"],
    queryFn: () => AllocationService.readNonAllocatees(),
  });
}

export function useAddAllocatees(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (users: UserRead[]) =>
      AllocationService.addAllocatees(
        projectId,
        users.map((user) => user.id),
      ),
    onMutate: async (users) => {
      await queryClient.cancelQueries({ queryKey: ["projects", "allocatees", projectId] });
      const oldAllocatees = queryClient.getQueryData(["projects", "allocatees", projectId]) as UserRead[];
      queryClient.setQueryData(["projects", "allocatees", projectId], oldAllocatees.concat(users));
      return { oldAllocatees };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(["projects", "allocatees", projectId], context?.oldAllocatees);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", "allocatees", projectId] });
      queryClient.invalidateQueries({ queryKey: ["projects", "non-allocatees"] });
    },
  });
}

export function useRemoveAllocatee(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => AllocationService.removeAllocatee(projectId, userId),
    onMutate: async (userId: string) => {
      await queryClient.cancelQueries({ queryKey: ["projects", "allocatees", projectId] });
      const oldAllocatees = queryClient.getQueryData(["projects", "allocatees", projectId]) as UserRead[];
      queryClient.setQueryData(
        ["projects", "allocatees", projectId],
        oldAllocatees.filter((user: UserRead) => user.id !== userId),
      );
      return { oldAllocatees };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(["projects", "allocatees", projectId], context?.oldAllocatees);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", "allocatees", projectId] });
      queryClient.invalidateQueries({ queryKey: ["projects", "non-allocatees"] });
    },
  });
}

export function useAllocateProjects() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => AllocationService.allocateProjects(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useDeallocateProjects() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => AllocationService.deallocateProjects(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useAcceptAllocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => AllocationService.acceptAllocation(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["projects", "allocated-project"] });
      const oldProject = queryClient.getQueryData(["projects", "allocated-project"]) as ProjectReadWithAllocations;
      queryClient.setQueryData(["projects", "allocated-project"], {
        ...oldProject,
        allocations: [{ ...oldProject.allocations[0], accepted: true }],
      });
      return { oldProject };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(["projects", "allocated-project"], context?.oldProject);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", "allocated-project"] });
    },
  });
}

export function useRejectAllocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => AllocationService.rejectAllocation(),
    onMutate: async () => {
      // TODO: This is not working
      await queryClient.cancelQueries({ queryKey: ["projects", "allocated-project"] });
      const oldProject = queryClient.getQueryData(["projects", "allocated-project"]) as ProjectReadWithAllocations;
      queryClient.setQueryData(["projects", "allocated-project"], {
        ...oldProject,
        allocations: [{ ...oldProject.allocations[0], accepted: false }],
      });
      return { oldProject };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(["projects", "allocated-project"], context?.oldProject);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", "allocated-project"] });
    },
  });
}

export function useLockAllocations() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => AllocationService.lockAllocations(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", "allocated-project"] });
    },
  });
}

export function useUnlockAllocations() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => AllocationService.unlockAllocations(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", "allocated-project"] });
    },
  });
}
