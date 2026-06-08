import { Link } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth.js';

function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-10 border-b border-gray-100 bg-white lg:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-xl font-bold text-blue-500 hover:text-blue-600">
          Twitter Clone
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">{user?.username}</span>
          <button
            onClick={logout}
            className="rounded-full bg-red-500 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-600"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
