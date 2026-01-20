import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
    it('renders application title', () => {
        render(<App />);
        const linkElement = screen.getByText(/TripBook/i);
        expect(linkElement).toBeInTheDocument();
    });
});
