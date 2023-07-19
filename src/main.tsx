import './index.css';

import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import App from './App';
import CenterLayout from './components/layouts/CenterLayout';
import HeaderLayout from './components/layouts/HeaderLayout';
import SiderLayout from './components/layouts/SiderLayout';
import Error from './pages/Error';
import AddProject from './pages/projects/AddProject';
import EditProject from './pages/projects/EditProject';
import Project from './pages/projects/Project';
import Projects from './pages/projects/Projects';
import ProposedProjects from './pages/projects/ProposedProjects';
import ShortlistedProjects from './pages/projects/ShortlistedProjects';
import SignIn from './pages/SignIn';
import User, { loader as userLoader } from './pages/users/User';

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
            element: <Projects />,
            loader: undefined,
            children: [
              {
                path: "proposed",
                element: <ProposedProjects />,
                loader: undefined,
              },
              {
                path: "shortlisted",
                element: <ShortlistedProjects />,
                loader: undefined,
              },
              {
                path: "add",
                element: <AddProject />,
                action: undefined,
              },
              {
                path: ":id",
                element: <Project />,
                loader: undefined,
              },
              {
                path: ":id/edit",
                element: <EditProject />,
                loader: undefined,
                action: undefined,
              },
            ]
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
    <App>
      <RouterProvider router={router} />
    </App>
  </React.StrictMode>,
)
