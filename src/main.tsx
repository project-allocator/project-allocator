import './index.css';

import { MsalProvider } from '@azure/msal-react';
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { Navigate, Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { msalInstance } from './auth';
import CenterLayout from './components/layouts/CenterLayout';
import HeaderLayout from './components/layouts/HeaderLayout';
import SiderLayout from './components/layouts/SiderLayout';
import { NotificationContextProvider } from './contexts/NotificationContext';
import { UserContextProvider } from './contexts/UserContext';
import Error from './pages/Error';
import SignIn from './pages/SignIn';
import Admin, { adminLoader } from './pages/admins/Admin';
import Allocated, { allocatedLoader } from './pages/allocations/Allocated';
import Project, { projectLoader } from './pages/projects/Project';
import ProjectAdd, { projectAddAction } from './pages/projects/ProjectAdd';
import ProjectEdit, { projectEditAction, projectEditLoader } from './pages/projects/ProjectEdit';
import Projects, { projectsLoader } from './pages/projects/Projects';
import Proposed, { proposedLoader } from './pages/proposals/Proposed';
import Shortlisted, { shortlistedLoader } from './pages/shortlists/Shortlisted';
import User, { currentUserLoader, userLoader } from './pages/users/User';
import AdminRoute from './routes/AdminRoute';
import AuthRoute from './routes/AuthRoute';
import GuestRoute from './routes/GuestRoute';
import StaffRoute from './routes/StaffRoute';
import StudentRoute from './routes/StudentRoute';

const router = createBrowserRouter([
  {
    element: (
      <HeaderLayout>
        <Outlet />
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
        element: (
          <CenterLayout>
            <AuthRoute redirect>
              <Navigate to="/projects" />,
            </AuthRoute>
          </CenterLayout>
        ),
      },
      {
        path: "signin",
        element: (
          <CenterLayout>
            <GuestRoute redirect>
              <SignIn />
            </GuestRoute>
          </CenterLayout>
        ),
      },
      {
        element: (
          <SiderLayout>
            <AuthRoute redirect>
              <Outlet />
            </AuthRoute>
          </SiderLayout>
        ),
        children: [
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
                  <StaffRoute redirect>
                    <ProjectAdd />
                  </StaffRoute>
                ),
                action: projectAddAction,
              },
              {
                path: ":id/edit",
                element: (
                  <StaffRoute redirect>
                    <ProjectEdit />
                  </StaffRoute>
                ),
                loader: projectEditLoader,
                action: projectEditAction,
              },
            ]
          },
          {
            path: "proposed",
            element: (
              <StaffRoute redirect>
                <Proposed />
              </StaffRoute>
            ),
            loader: proposedLoader,
          },
          {
            path: "shortlisted",
            element: (
              <StudentRoute redirect>
                <Shortlisted />
              </StudentRoute>
            ),
            loader: shortlistedLoader,
          },
          {
            path: "allocated",
            element: (
              <StudentRoute redirect>
                <Allocated />
              </StudentRoute>
            ),
            loader: allocatedLoader,
          },
          {
            path: "admin",
            element: (
              <AdminRoute redirect>
                <Admin />
              </AdminRoute>
            ),
            loader: adminLoader,
          },
          {
            path: "profile",
            element: <User />,
            loader: currentUserLoader,
          },
          {
            path: "users/:id",
            element: <User />,
            loader: userLoader,
          },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MsalProvider instance={msalInstance}>
      <UserContextProvider>
        <NotificationContextProvider>
          <RouterProvider router={router} />
        </NotificationContextProvider>
      </UserContextProvider>
    </MsalProvider>
  </React.StrictMode>,
);
