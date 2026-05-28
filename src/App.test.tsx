import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

describe('App', () => {
  it('renders application title', () => {
    // App uses react-router hooks (useNavigate), so it must be rendered
    // inside a Router provider.
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    const linkElement = screen.getByText(/TripBook/i);
    expect(linkElement).toBeInTheDocument();
  });
});
