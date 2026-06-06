import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('should render the home page', () => {
    render(<App />);
    expect(screen.getByText('Home')).toBeDefined();
  });
});
