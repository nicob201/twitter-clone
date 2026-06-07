import { describe, it, expect } from 'vitest';
import { navigationItems } from '../navigation.js';

describe('navigation config', () => {
  it('should contain all expected navigation links', () => {
    const labels = navigationItems.map((item) => item.label);
    expect(labels).toContain('Home');
    expect(labels).toContain('Search');
    expect(labels).toContain('Profile');
    expect(navigationItems).toHaveLength(3);
  });

  it('should have paths for each navigation item', () => {
    for (const item of navigationItems) {
      expect(item.path).toBeTruthy();
      expect(item.path.startsWith('/')).toBe(true);
    }
  });
});
