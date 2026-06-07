import { Link, Outlet } from 'react-router-dom';
import Header from './Header.js';
import MobileNav from './MobileNav.js';
import Sidebar from './Sidebar.js';

const suggestedUsers = [
  { id: 'alice', username: 'alice' },
  { id: 'carol', username: 'carol' },
  { id: 'eve', username: 'eve' },
];

function SuggestedUsers() {
  return (
    <aside className="hidden border-r border-gray-100 bg-white lg:block lg:w-80">
      <div className="sticky top-0 p-4">
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
          <h2 className="px-4 py-3 text-lg font-bold text-gray-900">Who to follow</h2>
          <div>
            {suggestedUsers.map((user) => (
              <Link
                key={user.id}
                to={`/profile/${user.id}`}
                className="flex items-center gap-3 border-t border-gray-100 px-4 py-3 transition-colors hover:bg-gray-50/50"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                  {user.username[0]?.toUpperCase() ?? '?'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-gray-900">{user.username}</p>
                  <p className="truncate text-sm text-gray-500">@{user.username}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="mx-auto flex max-w-6xl">
        <Sidebar />
        <main className="min-h-screen flex-1 border-x border-gray-100 bg-white pb-16 lg:pb-0">
          <Outlet />
        </main>
        <SuggestedUsers />
      </div>
      <MobileNav />
    </div>
  );
}

export default Layout;
