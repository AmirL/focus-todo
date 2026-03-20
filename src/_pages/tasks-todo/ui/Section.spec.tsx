import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ContentSection } from './Section';

vi.mock('@/shared/ui/card', () => ({
  Card: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
  CardContent: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
}));

describe('ContentSection', () => {
  it('renders title and children', () => {
    render(
      <ContentSection title="My Section">
        <p>Section content</p>
      </ContentSection>
    );

    expect(screen.getByText('My Section')).toBeDefined();
    expect(screen.getByText('Section content')).toBeDefined();
  });
});
