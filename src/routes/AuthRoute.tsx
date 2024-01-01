import { useAuth } from "@/hooks/users";
import { Navigate, Outlet } from "react-router-dom";

export default function AuthRoute({ fallback }: { fallback: string }) {
  const { isAuth } = useAuth();
  return isAuth ? <Outlet /> : <Navigate to={fallback} />;
}
