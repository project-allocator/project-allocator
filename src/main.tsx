import './index.css';

import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import CenterLayout from './components/layouts/CenterLayout';
import HeaderLayout from './components/layouts/HeaderLayout';
import SiderLayout from './components/layouts/SiderLayout';
import Error from './pages/Error';
import Project, { loader as projectLoader } from './pages/projects/Project';
import ProjectAdd, { action as projectAddAction } from './pages/projects/ProjectAdd';
import ProjectEdit, { action as projectEditAction, loader as projectEditLoader } from './pages/projects/ProjectEdit';
import Projects, { loader as projectsLoader } from './pages/projects/Projects';
import Proposed, { loader as proposedLoader } from './pages/projects/Proposed';
import Shortlisted, { loader as shortlistedLoader } from './pages/projects/Shortlisted';
import SignIn from './pages/SignIn';
import Profile, { loader as userViewLoader } from './pages/users/User';

// TODO: Split the route object into separet files
// https://reactrouter.com/en/main/routers/create-browser-router
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
            path: "profile",
            element: <Profile />,
            loader: userViewLoader,
          },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
