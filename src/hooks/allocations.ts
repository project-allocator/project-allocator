import { AllocationService, UserRead } from "@/api";
import { useMutation, useQuery, useQueryClient } from "react-query";

export function useAllocatedProject() {
  return useQuery(["projects", "allocated"], () => AllocationService.readAllocatedProject());
}

export function useAllocatees(projectId: string) {
  return useQuery(["projects", "allocatees", projectId], () => AllocationService.readAllocatees(projectId));
}

export function useAddAllocatees(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation(
    // TODO: Passing UserRead[] to implement optimistic updates but there may be a better way
    (users: UserRead[]) =>
      AllocationService.addAllocatees(
        projectId,
        users.map((user) => user.id)
      ),
    {
      onMutate: async (users) => {
        await queryClient.cancelQueries(["projects", "allocatees", projectId]);
        const oldAllocatees = queryClient.getQueryData(["projects", "allocatees", projectId]);
        queryClient.setQueryData(["projects", "allocatees", projectId], (oldAllocatees as any).concat(users));
        return { oldAllocatees };
      },
      onError: (error, variables, context: any) => {
        queryClient.setQueryData(["projects", "allocatees", projectId], context.oldAllocatees);
      },
      onSettled: () => {
        queryClient.invalidateQueries(["projects", "allocatees", projectId]);
      },
    }
  );
}

export function useRemoveAllocatee(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation((userId: string) => AllocationService.removeAllocatee(projectId, userId), {
    onMutate: async (userId: string) => {
      await queryClient.cancelQueries(["projects", "allocatees", projectId]);
      const oldAllocatees = queryClient.getQueryData(["projects", "allocatees", projectId]);
      queryClient.setQueryData(
        ["projects", "allocatees", projectId],
        (oldAllocatees as any).filter((user: UserRead) => user.id !== userId)
      );
      return { oldAllocatees };
    },
    onError: (error, variables, context: any) => {
      queryClient.setQueryData(["projects", "allocatees", projectId], context.oldAllocatees);
    },
    onSettled: () => {
      queryClient.invalidateQueries(["projects", "allocatees", projectId]);
    },
  });
}

export function useAllocateProjects() {
  const queryClient = useQueryClient();

  return useMutation(() => AllocationService.allocateProjects(), {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] }); // Maybe not needed
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useDeallocateProjects() {
  const queryClient = useQueryClient();

  return useMutation(() => AllocationService.deallocateProjects(), {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] }); // Maybe not needed
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useSetAllocationStatus(userId: string) {
  const queryClient = useQueryClient();

  return useMutation(({ accepted }: { accepted: boolean }) => AllocationService.setAllocationStatus({ accepted }), {
    onMutate: async ({ accepted }) => {
      await queryClient.cancelQueries(["users", userId]);
      const oldUser = queryClient.getQueryData(["users", userId]);
      queryClient.setQueryData(["users", userId], ((oldUser as any).accepted = accepted));
      return { oldUser };
    },
    onError: (error, variables, context: any) => {
      queryClient.setQueryData(["users", userId], context.oldUser);
    },
    onSettled: () => {
      queryClient.invalidateQueries(["users", userId]);
    },
  });
}

export function useResetAllocationStatus(userId: string) {
  const queryClient = useQueryClient();

  return useMutation(() => AllocationService.resetAllocationStatus(), {
    onMutate: async () => {
      await queryClient.cancelQueries(["users", userId]);
      const oldUser = queryClient.getQueryData(["users", userId]);
      queryClient.setQueryData(["users", userId], ((oldUser as any).accepted = false));
      return { oldUser };
    },
    onError: (error, variables, context: any) => {
      queryClient.setQueryData(["users", userId], context.oldUser);
    },
    onSettled: () => {
      queryClient.invalidateQueries(["users", userId]);
    },
  });
}
