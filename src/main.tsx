import './index.css';

import { MsalProvider } from '@azure/msal-react';
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import CenterLayout from './components/layouts/CenterLayout';
import HeaderLayout from './components/layouts/HeaderLayout';
import SiderLayout from './components/layouts/SiderLayout';
import Admin, { adminLoader } from './pages/admins/Admin';
import Error from './pages/Error';
import Project, { projectLoader } from './pages/projects/Project';
import ProjectAdd, { projectAddAction } from './pages/projects/ProjectAdd';
import { projectDeleteAction } from './pages/projects/ProjectDelete';
import ProjectEdit, { projectEditAction, projectEditLoader } from './pages/projects/ProjectEdit';
import Projects, { projectsLoader } from './pages/projects/Projects';
import Proposed, { proposedLoader } from './pages/proposals/Proposed';
import Shortlisted, { shortlistedLoader } from './pages/shortlists/Shortlisted';
import SignIn from './pages/SignIn';
import User, { currentUserLoader, userLoader } from './pages/users/User';
import { msalInstance } from './services/auth';

const router = createBrowserRouter([
  {
    path: "/",
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
        element: (
          <CenterLayout>
            <Outlet />
          </CenterLayout>
        ),
        children: [
          {
            index: true,
            element: <div />,
          },
          {
            path: "signin",
            element: <SignIn />,
            action: undefined,
          },
        ]
      },
      {
        element: (
          <SiderLayout>
            <Outlet />
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
                path: "add",
                element: <ProjectAdd />,
                action: projectAddAction,
              },
              {
                path: ":id",
                element: <Project />,
                loader: projectLoader,
              },
              {
                path: ":id/edit",
                element: <ProjectEdit />,
                loader: projectEditLoader,
                action: projectEditAction,
              },
              {
                path: ":id/delete",
                action: projectDeleteAction,
              },
            ]
          },
          {
            path: "proposed",
            element: <Proposed />,
            loader: proposedLoader,
          },
          {
            path: "shortlisted",
            element: <Shortlisted />,
            loader: shortlistedLoader,
          },
          {
            path: "admin",
            element: <Admin />,
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
      <RouterProvider router={router} />
    </MsalProvider>
  </React.StrictMode>,
);
