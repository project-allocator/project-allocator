import { useAuth } from "@/hooks/users";
import { Navigate, Outlet } from "react-router-dom";

export default function StudentRoute({ fallback }: { fallback: string }) {
  const { isLoading, isStudent } = useAuth();
  if (isLoading) return null;

  return isStudent ? <Outlet /> : <Navigate to={fallback} />;
}
