import "./index.css";

import { MsalProvider } from "@azure/msal-react";
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { Navigate, Outlet, RouterProvider, createBrowserRouter } from "react-router-dom";
import { msalInstance } from "./auth";
import CenterLayout from "./components/layouts/CenterLayout";
import HeaderLayout from "./components/layouts/HeaderLayout";
import SiderLayout from "./components/layouts/SiderLayout";
import { ConfigContextProvider } from "./contexts/ConfigContext";
import { MessageContextProvider } from "./contexts/MessageContext";
import { TemplateContextProvider } from "./contexts/TemplateContext";
import { UserContextProvider } from "./contexts/UserContext";
import Error from "./pages/Error";
import SignIn from "./pages/SignIn";
import ManageAllocations, { manageAllocationsLoader } from "./pages/admins/ManageAllocations";
import ManageData from "./pages/admins/ManageData";
import ManageNotifications from "./pages/admins/ManageNotifications";
import ManageProjects, { manageProjectsLoader } from "./pages/admins/ManageProjects";
import ManageUsers, { manageUsersLoader } from "./pages/admins/ManageUsers";
import AllocatedProject, { allocatedProjectLoader } from "./pages/allocations/AllocatedProject";
import AddProject, { addProjectAction } from "./pages/projects/AddProject";
import EditProject, { editProjectAction, editProjectLoader } from "./pages/projects/EditProject";
import Project, { projectLoader } from "./pages/projects/Project";
import Projects, { projectsLoader } from "./pages/projects/Projects";
import ProposedProject, { proposedProjectLoader } from "./pages/proposals/ProposedProject";
import ShortlistedProjects, { shortlistedProjectsLoader } from "./pages/shortlists/ShortlistedProjects";
import { EditUser, editUserAction, editUserLoader } from "./pages/users/EditUser";
import User, { userLoader } from "./pages/users/User";
import AdminRoute from "./routes/AdminRoute";
import AuthRoute from "./routes/AuthRoute";
import GuestRoute from "./routes/GuestRoute";
import StaffRoute from "./routes/StaffRoute";
import StudentRoute from "./routes/StudentRoute";

const router = createBrowserRouter([
  {
    path: "signin",
    element: (
      <CenterLayout>
        <GuestRoute fallback="/">
          <SignIn />
        </GuestRoute>
      </CenterLayout>
    ),
  },
  {
    element: (
      <HeaderLayout>
        <SiderLayout>
          <AuthRoute fallback="/signin">
            <Outlet />
          </AuthRoute>
        </SiderLayout>
      </HeaderLayout>
    ),
    errorElement: (
      <HeaderLayout>
        <Error />
      </HeaderLayout>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/projects" />,
      },
      {
        path: "projects",
        children: [
          {
            index: true,
            element: <Projects />,
            loader: projectsLoader,
          },
          {
            path: ":id",
            element: <Project />,
            loader: projectLoader,
          },
          {
            path: "add",
            element: (
              <StaffRoute fallback="/">
                <AddProject />
              </StaffRoute>
            ),
            action: addProjectAction,
          },
          {
            path: ":id/edit",
            element: (
              <StaffRoute fallback="/">
                <EditProject />
              </StaffRoute>
            ),
            loader: editProjectLoader,
            action: editProjectAction,
          },
        ],
      },
      {
        path: "proposed",
        element: (
          <StaffRoute fallback="/">
            <ProposedProject />
          </StaffRoute>
        ),
        loader: proposedProjectLoader,
      },
      {
        path: "shortlisted",
        element: (
          <StudentRoute fallback="/">
            <ShortlistedProjects />
          </StudentRoute>
        ),
        loader: shortlistedProjectsLoader,
      },
      {
        path: "allocated",
        element: (
          <StudentRoute fallback="/">
            <AllocatedProject />
          </StudentRoute>
        ),
        loader: allocatedProjectLoader,
      },
      {
        path: "admin",
        element: (
          <AdminRoute fallback="/">
            <Outlet />
          </AdminRoute>
        ),
        children: [
          {
            path: "users",
            element: <ManageUsers />,
            loader: manageUsersLoader,
          },
          {
            path: "projects",
            element: <ManageProjects />,
            loader: manageProjectsLoader,
          },
          {
            path: "allocations",
            element: <ManageAllocations />,
            loader: manageAllocationsLoader,
          },
          {
            path: "notifications",
            element: <ManageNotifications />,
          },
          {
            path: "data",
            element: <ManageData />,
          },
        ],
      },
      {
        path: "users",
        children: [
          {
            path: ":id",
            element: <User />,
            loader: userLoader,
          },
          {
            path: ":id/edit",
            element: (
              <AdminRoute fallback="/">
                <EditUser />
              </AdminRoute>
            ),
            loader: editUserLoader,
            action: editUserAction,
          },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MsalProvider instance={msalInstance}>
      <ConfigContextProvider>
        <TemplateContextProvider>
          <UserContextProvider>
            <MessageContextProvider>
              <RouterProvider router={router} />
            </MessageContextProvider>
          </UserContextProvider>
        </TemplateContextProvider>
      </ConfigContextProvider>
    </MsalProvider>
  </React.StrictMode>
);
