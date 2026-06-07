import { NavLink } from 'react-router-dom';
import { navigationItems } from '../config/navigation.js';

function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 border-t border-gray-100 bg-white lg:hidden">
      <div className="flex justify-around py-1">
        {navigationItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                isActive ? 'bg-blue-50 font-bold text-blue-500' : 'text-gray-500 hover:bg-gray-100'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default MobileNav;
