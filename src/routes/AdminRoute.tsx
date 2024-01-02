import { useAuth } from "@/hooks/users";
import { Navigate, Outlet } from "react-router-dom";

export default function AdminRoute({ fallback }: { fallback: string }) {
  const { isLoading, isError, isAdmin } = useAuth();
  if (isLoading || isError) return null;

  return isAdmin ? <Outlet /> : <Navigate to={fallback} />;
}
