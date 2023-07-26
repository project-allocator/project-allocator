import { useUserContext } from "@/contexts/UserContext";
import { Navigate } from "react-router-dom";

interface GuestRouteProps {
  children: React.ReactNode;
  redirect?: boolean;
}

export default function GuestRoute({ children, redirect }: GuestRouteProps) {
  const { user } = useUserContext();
  if (user) {
    if (redirect) return <Navigate to="/" />;
    return null;
  }
  return children;
}