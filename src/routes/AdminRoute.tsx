import { useCurrentUser, useCurrentUserRole } from "@/hooks/users";
import { Navigate, Outlet } from "react-router-dom";

export default function AdminRoute({ fallback }: { fallback: string }) {
  const user = useCurrentUser();
  if (user.isLoading) return null;

  const { isAdmin } = useCurrentUserRole();
  return isAdmin ? <Outlet /> : <Navigate to={fallback} />;
}
