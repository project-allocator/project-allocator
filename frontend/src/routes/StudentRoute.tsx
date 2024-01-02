import { useAuth } from "@/hooks/users";
import { Navigate, Outlet } from "react-router-dom";

export default function StudentRoute({ fallback }: { fallback: string }) {
  const { isLoading, isError, isStudent } = useAuth();
  if (isLoading || isError) return null;

  return isStudent ? <Outlet /> : <Navigate to={fallback} />;
}
