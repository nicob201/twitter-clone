import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from '../features/auth/context/AuthContext.js';
import { router } from './router.js';

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
