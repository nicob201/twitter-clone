import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from '../shared/components/ProtectedRoute.js';
import LoginPage from '../features/auth/pages/LoginPage.js';
import RegisterPage from '../features/auth/pages/RegisterPage.js';
import Home from '../pages/Home.js';

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
        path: '/',
        element: <Home />,
      },
    ],
  },
]);
