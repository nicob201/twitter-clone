import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from './Home';

describe('Home', () => {
  it('should render the page heading', () => {
    render(<Home />);

    expect(screen.getByRole('heading', { name: 'Home' })).toBeDefined();
  });
});
