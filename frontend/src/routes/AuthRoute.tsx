import { useAuth } from "@/hooks/users";
import { Navigate, Outlet } from "react-router-dom";

export default function AuthRoute({ fallback }: { fallback: string }) {
  const { isLoading, isAuth } = useAuth();
  if (isLoading) return null;

  return isAuth ? <Outlet /> : <Navigate to={fallback} />;
}
