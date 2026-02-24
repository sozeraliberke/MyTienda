import { render, screen } from '@testing-library/react';
import App from './App';
import { test, expect } from 'vitest';

test('renders MyTienda headline', () => {
    render(<App />);
    const linkElement = screen.getByText(/MyTienda \(Frontend\)/i);
    expect(linkElement).toBeDefined();
});
