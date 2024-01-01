import "./index.css";

import { MsalProvider } from "@azure/msal-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";
import ReactDOM from "react-dom/client";
import { Navigate, Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from "react-router-dom";
import { msalInstance } from "./auth";
import CenterLayout from "./components/layouts/CenterLayout";
import SiderLayout from "./components/layouts/SiderLayout";
import { MessageContextProvider } from "./contexts/MessageContext";
import SignIn from "./pages/SignIn";
import ManageAllocations from "./pages/admins/ManageAllocations";
import ManageData from "./pages/admins/ManageData";
import ManageNotifications from "./pages/admins/ManageNotifications";
import ManageProjects from "./pages/admins/ManageProjects";
import ManageUsers from "./pages/admins/ManageUsers";
import AllocatedProject from "./pages/allocations/AllocatedProject";
import AddProject from "./pages/projects/AddProject";
import EditProject from "./pages/projects/EditProject";
import Project from "./pages/projects/Project";
import Projects from "./pages/projects/Projects";
import ProposedProjects from "./pages/proposals/ProposedProjects";
import ShortlistedProjects from "./pages/shortlists/ShortlistedProjects";
import { EditUser } from "./pages/users/EditUser";
import User from "./pages/users/User";
import AdminRoute from "./routes/AdminRoute";
import AuthRoute from "./routes/AuthRoute";
import GuestRoute from "./routes/GuestRoute";
import StaffRoute from "./routes/StaffRoute";
import StudentRoute from "./routes/StudentRoute";

// We use createBrowserRouter() for data API support,
// together with createRoutesFromElements() for readability.
// https://reactrouter.com/en/main/routers/picking-a-router
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">
      <Route element={<GuestRoute fallback="/" />}>
        <Route element={<CenterLayout />}>
          <Route path="signin" element={<SignIn />} />
        </Route>
      </Route>
      <Route element={<AuthRoute fallback="/signin" />}>
        <Route element={<SiderLayout />}>
          <Route index element={<Navigate to="/projects" />} />
          <Route path="projects" handle={{ crumb: "All Projects" }}>
            <Route index element={<Projects />} />
            <Route path=":id" element={<Project />} handle={{ crumb: "Project" }} />
            <Route element={<StaffRoute fallback="/" />}>
              <Route path="add" element={<AddProject />} handle={{ crumb: "Add Project" }} />
              <Route path=":id/edit" element={<EditProject />} handle={{ crumb: "Edit Project" }} />
            </Route>
          </Route>
          <Route element={<StaffRoute fallback="/" />}>
            <Route path="proposed" element={<ProposedProjects />} handle={{ crumb: "Proposed Projects" }} />
          </Route>
          <Route element={<StudentRoute fallback="/" />}>
            <Route path="shortlisted" element={<ShortlistedProjects />} handle={{ crumb: "Shortlisted Projects" }} />
            <Route path="allocated" element={<AllocatedProject />} handle={{ crumb: "Allocated Project" }} />
          </Route>
          <Route path="admins" element={<AdminRoute fallback="/" />} handle={{ crumb: "Admins" }}>
            <Route path="users" element={<ManageUsers />} handle={{ crumb: "Manage Users" }} />
            <Route path="projects" element={<ManageProjects />} handle={{ crumb: "Manage Projects" }} />
            <Route path="allocations" element={<ManageAllocations />} handle={{ crumb: "Manage Allocations" }} />
            <Route path="notifications" element={<ManageNotifications />} handle={{ crumb: "Manage Notifications" }} />
            <Route path="data" element={<ManageData />} handle={{ crumb: "Manage Data" }} />
          </Route>
          <Route path="users" handle={{ crumb: "All Users" }}>
            <Route index element={<Navigate to="/admins/users" />} />
            <Route path=":id" element={<User />} handle={{ crumb: "User Profile" }} />
            <Route element={<AdminRoute fallback="/" />}>
              <Route path=":id/edit" element={<EditUser />} handle={{ crumb: "Edit User Profile" }} />
            </Route>
          </Route>
        </Route>
      </Route>
    </Route>
  )
);

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MsalProvider instance={msalInstance}>
      <QueryClientProvider client={queryClient}>
        <MessageContextProvider>
          <RouterProvider router={router} />
        </MessageContextProvider>
      </QueryClientProvider>
    </MsalProvider>
  </React.StrictMode>
);
