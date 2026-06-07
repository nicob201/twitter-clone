import { useAuth } from '../features/auth/hooks/useAuth.js';

function Home() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between rounded-lg bg-white p-6 shadow-md">
          <div>
            <h1 className="text-2xl font-bold">Welcome, {user?.username}</h1>
            <p className="mt-1 text-gray-600">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
