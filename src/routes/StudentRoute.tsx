import { useAuth } from "@/hooks/users";
import { Navigate, Outlet } from "react-router-dom";

export default function StudentRoute({ fallback }: { fallback: string }) {
  const { isStudent } = useAuth();
  return isStudent ? <Outlet /> : <Navigate to={fallback} />;
}
