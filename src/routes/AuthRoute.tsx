import { useUserContext } from "@/contexts/UserContext";
import { Navigate } from "react-router-dom";

interface AuthRouteProps {
  children: React.ReactNode;
  redirect?: boolean;
}

// TODO: Find better ways to switch redirect
export default function AuthRoute({ children, redirect }: AuthRouteProps) {
  const { user } = useUserContext();
  if (!user) {
    if (redirect) return <Navigate to="/signin" />;
    return null
  }
  return children;
}