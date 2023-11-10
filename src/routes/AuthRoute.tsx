import { useUser } from "@/contexts/UserContext";
import { Navigate } from "react-router-dom";

interface AuthRouteProps {
  children: React.ReactNode;
  fallback?: string;
}

export default function AuthRoute({ children, fallback }: AuthRouteProps) {
  const { user } = useUser();
  if (!user) {
    if (fallback) return <Navigate to={fallback} />;
    return null;
  }
  return children;
}
