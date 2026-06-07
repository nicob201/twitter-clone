import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PlaceholderPage from '../PlaceholderPage.js';

describe('PlaceholderPage', () => {
  it('should render the provided title as heading', () => {
    render(<PlaceholderPage title="Search" />);

    expect(screen.getByRole('heading', { name: 'Search' })).toBeDefined();
  });

  it('should render a not-yet-implemented message', () => {
    render(<PlaceholderPage title="Profile" />);

    expect(screen.getByText('This page is not yet implemented.')).toBeDefined();
  });

  it('should render different titles', () => {
    const { rerender } = render(<PlaceholderPage title="Search" />);
    expect(screen.getByRole('heading', { name: 'Search' })).toBeDefined();

    rerender(<PlaceholderPage title="Profile" />);
    expect(screen.getByRole('heading', { name: 'Profile' })).toBeDefined();
  });
});
