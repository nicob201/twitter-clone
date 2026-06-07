import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from '../shared/components/ProtectedRoute.js';
import Layout from '../shared/components/Layout.js';
import LoginPage from '../features/auth/pages/LoginPage.js';
import RegisterPage from '../features/auth/pages/RegisterPage.js';
import TimelinePage from '../features/timeline/pages/TimelinePage.js';
import SearchPage from '../features/user-search/pages/SearchPage.js';
import ProfilePage from '../features/user-profile/pages/ProfilePage.js';

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
          { path: '/', element: <TimelinePage /> },
          { path: '/search', element: <SearchPage /> },
          { path: '/profile', element: <ProfilePage /> },
        ],
      },
    ],
  },
]);
