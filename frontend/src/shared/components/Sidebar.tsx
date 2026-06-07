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
                  `block rounded-full px-4 py-3 text-lg font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 font-bold text-blue-500'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;
