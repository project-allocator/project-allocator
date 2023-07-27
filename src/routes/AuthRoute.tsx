import { useUserContext } from "@/contexts/UserContext";
import { Navigate } from "react-router-dom";

interface AuthRouteProps {
  children: React.ReactNode;
  fallback?: string;
}

// TODO: Find better ways to switch redirect
export default function AuthRoute({ children, fallback }: AuthRouteProps) {
  const { user } = useUserContext();
  if (!user) {
    if (fallback) return <Navigate to={fallback} />;
    return null
  }
  return children;
}