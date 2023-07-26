import { useUserContext } from "@/contexts/UserContext";
import { Navigate } from "react-router-dom";

interface StaffRouteProps {
    children: React.ReactNode;
    redirect?: boolean;
}

export default function StaffRoute({ children, redirect }: StaffRouteProps) {
    const { user } = useUserContext();
    if (user?.role !== "staff" && user?.role !== "admin") {
        if (redirect) return <Navigate to="/" />;
        return null;
    }
    return children;
}