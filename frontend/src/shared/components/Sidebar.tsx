import { NavLink } from 'react-router-dom';
import { navigationItems } from '../config/navigation.js';

function Sidebar() {
  return (
    <aside className="hidden border-r border-gray-100 bg-white lg:block lg:w-64">
      <nav className="sticky top-0 px-3 py-4">
        <span className="mb-6 block px-3 text-2xl font-bold text-blue-500">Twitter Clone</span>
        <ul className="space-y-1">
          {navigationItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-4 rounded-full px-4 py-3 text-lg font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 font-bold text-blue-500'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  {item.path === '/' ? (
                    <>
                      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </>
                  ) : item.path === '/search' ? (
                    <>
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </>
                  ) : (
                    <>
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </>
                  )}
                </svg>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;
