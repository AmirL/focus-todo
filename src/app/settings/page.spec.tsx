import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SettingsPage from './page';

vi.mock('@/features/lists', () => ({
  ListManager: () => <div data-testid="list-manager">ListManager</div>,
}));

vi.mock('@/features/api-keys', () => ({
  ApiKeysManager: () => <div data-testid="api-keys-manager">ApiKeysManager</div>,
}));

vi.mock('@/features/current-initiative/history', () => ({
  InitiativeHistory: () => <div data-testid="initiative-history">InitiativeHistory</div>,
}));

describe('SettingsPage', () => {
  it('renders the settings heading and description', () => {
    render(<SettingsPage />);

    expect(screen.getByText('Settings')).toBeDefined();
    expect(screen.getByText('Manage your preferences and customize your workflow.')).toBeDefined();
  });

  it('renders all settings sections', () => {
    render(<SettingsPage />);

    expect(screen.getByTestId('list-manager')).toBeDefined();
    expect(screen.getByTestId('initiative-history')).toBeDefined();
    expect(screen.getByTestId('api-keys-manager')).toBeDefined();
  });
});
