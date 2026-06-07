import { Outlet } from 'react-router-dom';
import Header from './Header.js';
import MobileNav from './MobileNav.js';
import Sidebar from './Sidebar.js';

function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="mx-auto flex max-w-6xl">
        <Sidebar />
        <main className="min-h-screen flex-1 border-x border-gray-200 bg-white pb-16 lg:pb-0">
          <Outlet />
        </main>
        <aside className="hidden border-r border-gray-200 bg-white lg:block lg:w-80">
          <div className="sticky top-0 p-4">
            <div className="rounded-lg bg-gray-100 p-4">
              <p className="text-sm text-gray-500">Right panel placeholder</p>
            </div>
          </div>
        </aside>
      </div>
      <MobileNav />
    </div>
  );
}

export default Layout;
