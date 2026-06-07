import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from '../shared/components/ProtectedRoute.js';
import Layout from '../shared/components/Layout.js';
import LoginPage from '../features/auth/pages/LoginPage.js';
import RegisterPage from '../features/auth/pages/RegisterPage.js';
import Home from '../pages/Home.js';
import PlaceholderPage from '../shared/components/PlaceholderPage.js';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <Layout />,
        children: [
          { path: '/', element: <Home /> },
          { path: '/search', element: <PlaceholderPage title="Search" /> },
          { path: '/profile', element: <PlaceholderPage title="Profile" /> },
        ],
      },
    ],
  },
]);
