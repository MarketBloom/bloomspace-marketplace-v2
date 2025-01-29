import { describe, it, expect } from 'vitest';
import { Hero } from '@/components/Hero';
import { renderWithProviders } from './test-utils';

describe('Hero component', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<Hero />);
    expect(container).toBeTruthy();
  });
});