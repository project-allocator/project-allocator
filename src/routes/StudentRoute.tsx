import { useCurrentUser, useCurrentUserRole } from "@/hooks/users";
import { Navigate, Outlet } from "react-router-dom";

export default function StudentRoute({ fallback }: { fallback: string }) {
  const user = useCurrentUser();
  if (user.isLoading) return null;

  const { isStudent } = useCurrentUserRole();
  return isStudent ? <Outlet /> : <Navigate to={fallback} />;
}
