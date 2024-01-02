import { useAuth } from "@/hooks/users";
import { Navigate, Outlet } from "react-router-dom";

export default function AuthRoute({ fallback }: { fallback: string }) {
  const { isLoading, isError, isAuth } = useAuth();
  if (isLoading || isError) return null;

  return isAuth ? <Outlet /> : <Navigate to={fallback} />;
}
