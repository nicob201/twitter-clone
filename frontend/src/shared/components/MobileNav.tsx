import { NavLink } from 'react-router-dom';
import { navigationItems } from '../config/navigation.js';

function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 border-t border-gray-200 bg-white lg:hidden">
      <div className="flex justify-around py-2">
        {navigationItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `px-3 py-1 text-sm font-medium ${isActive ? 'text-blue-500' : 'text-gray-500'}`
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
