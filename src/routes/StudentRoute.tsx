import { useUserContext } from "@/contexts/UserContext";
import { Navigate } from "react-router-dom";

interface StudentRouteProps {
    children: React.ReactNode;
    redirect?: boolean;
}

export default function StudentRoute({ children, redirect }: StudentRouteProps) {
    const { user } = useUserContext();
    if (user?.role !== "student") {
        if (redirect) return <Navigate to="/" />;
        return null;
    }
    return children;
}