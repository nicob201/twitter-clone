export interface NavItem {
  label: string;
  path: string;
}

export const navigationItems: NavItem[] = [
  { label: 'Home', path: '/' },
  { label: 'Search', path: '/search' },
  { label: 'Profile', path: '/profile' },
];
