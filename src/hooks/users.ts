import { UserService, UserUpdate } from "@/api";
import { authRequest } from "@/auth";
import { useMsal } from "@azure/msal-react";
import { useMutation, useQuery, useQueryClient } from "react-query";

export function useUsers(role?: string) {
  if (role === undefined) {
    return useQuery(["users"], () => UserService.readUsers());
  }
  return useQuery(["users", role], () => UserService.readUsers(role));
}

export function useUser(userId: string) {
  return useQuery(["users", userId], () => UserService.readUser(userId));
}

export function useCurrentUser() {
  return useQuery(["users", "current"], () => UserService.readCurrentUser().catch(() => null));
}

export function useCurrentUserRole() {
  const user = useCurrentUser();

  return {
    isAdmin: user.data?.role === "admin" ?? false,
    isStaff: user.data?.role === "staff" ?? false,
    isStudent: user.data?.role === "student" ?? false,
  };
}

export function useUpdateUser(userId: string) {
  const queryClient = useQueryClient();

  return useMutation((user: UserUpdate) => UserService.updateUser(userId, user), {
    onSuccess: () => {
      queryClient.invalidateQueries(["users", userId]);
    },
  });
}

export function useDeleteUser(userId: string) {
  const queryClient = useQueryClient();

  return useMutation(() => UserService.deleteUser(userId), {
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
    },
  });
}

export function useLoginUser() {
  const queryClient = useQueryClient();
  const { instance: msalInstance } = useMsal();

  return useMutation(
    async () => {
      const { account } = await msalInstance.loginPopup(authRequest);
      msalInstance.setActiveAccount(account);
      UserService.createUser();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["users", "current"]);
      },
    }
  );
}

export function useLogoutUser() {
  const queryClient = useQueryClient();
  const { instance: msalInstance } = useMsal();

  return useMutation(() => msalInstance.logoutPopup(), {
    onSuccess: () => {
      queryClient.invalidateQueries(["users", "current"]);
    },
  });
}
