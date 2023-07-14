import './index.css';

import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import './index.css';
import Error from './pages/Error';
import AddProject from './pages/projects/AddProject';
import EditProject from './pages/projects/EditProject';
import Project from './pages/projects/Project';
import Projects from './pages/projects/Projects';
import ProposedProjects from './pages/projects/ProposedProjects';
import ShortlistedProjects from './pages/projects/ShortlistedProjects';
import SignIn from './pages/SignIn';
import User from './pages/users/User';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <Error />,
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
        path: "users",
        element: <div>Not yet implemented</div>,
        loader: undefined,
        children: [
          {
            path: ":id",
            element: <User />,
            loader: undefined
          }
        ]
      }
    ],
  },
  {
    path: "/signin",
    element: <SignIn />,
    action: undefined,
  }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
