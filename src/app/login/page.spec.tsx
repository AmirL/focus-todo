import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from './page';

const mockSignIn = { email: vi.fn() };
const mockSignUp = { email: vi.fn() };

vi.mock('@/shared/lib/auth-client', () => ({
  signIn: { email: vi.fn((...args) => mockSignIn.email(...args)) },
  signUp: { email: vi.fn((...args) => mockSignUp.email(...args)) },
}));

vi.mock('@/shared/ui/button', () => ({
  Button: ({ children, ...props }: React.ComponentProps<'button'>) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock('@/shared/ui/input', () => ({
  Input: (props: React.ComponentProps<'input'>) => <input {...props} />,
}));

vi.mock('@/shared/ui/card', () => ({
  Card: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
  CardContent: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
  CardDescription: ({ children }: React.ComponentProps<'div'>) => <div>{children}</div>,
  CardHeader: ({ children }: React.ComponentProps<'div'>) => <div>{children}</div>,
  CardTitle: ({ children }: React.ComponentProps<'div'>) => <h1>{children}</h1>,
}));

// Mock window.location
const originalLocation = window.location;
beforeEach(() => {
  vi.clearAllMocks();
  Object.defineProperty(window, 'location', {
    writable: true,
    value: { ...originalLocation, href: '' },
  });
});

describe('LoginPage', () => {
  it('renders sign in form by default', () => {
    render(<LoginPage />);

    expect(screen.getByRole('heading', { name: 'Sign In' })).toBeDefined();
    expect(screen.getByText('Sign in to your account to continue')).toBeDefined();
    expect(screen.getByPlaceholderText('Email')).toBeDefined();
    expect(screen.getByPlaceholderText('Password')).toBeDefined();
  });

  it('toggles to sign up mode and shows name field', () => {
    render(<LoginPage />);

    fireEvent.click(screen.getByText('Sign up'));

    expect(screen.getByRole('heading', { name: 'Create Account' })).toBeDefined();
    expect(screen.getByText('Create a new account to get started')).toBeDefined();
    expect(screen.getByPlaceholderText('Full name')).toBeDefined();
  });

  it('toggles back to sign in mode', () => {
    render(<LoginPage />);

    // Go to sign up
    fireEvent.click(screen.getByText('Sign up'));
    expect(screen.getByRole('heading', { name: 'Create Account' })).toBeDefined();

    // Go back to sign in
    fireEvent.click(screen.getByText('Sign in'));
    expect(screen.getByRole('heading', { name: 'Sign In' })).toBeDefined();
  });

  it('updates form fields on input', () => {
    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('Email') as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText('Password') as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  it('submits sign in form and redirects on success', async () => {
    mockSignIn.email.mockResolvedValue({ data: {} });

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'pass' } });
    fireEvent.submit(screen.getByPlaceholderText('Email').closest('form')!);

    await waitFor(() => {
      expect(mockSignIn.email).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'pass',
      });
    });

    await waitFor(() => {
      expect(window.location.href).toBe('/');
    });
  });

  it('submits sign up form with name', async () => {
    mockSignUp.email.mockResolvedValue({ data: {} });

    render(<LoginPage />);

    fireEvent.click(screen.getByText('Sign up'));

    fireEvent.change(screen.getByPlaceholderText('Full name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'pass' } });
    fireEvent.submit(screen.getByPlaceholderText('Email').closest('form')!);

    await waitFor(() => {
      expect(mockSignUp.email).toHaveBeenCalledWith({
        email: 'john@example.com',
        password: 'pass',
        name: 'John',
      });
    });
  });

  it('submits sign up form with empty name defaults to empty string', async () => {
    mockSignUp.email.mockResolvedValue({ data: {} });

    render(<LoginPage />);

    fireEvent.click(screen.getByText('Sign up'));

    // Don't fill in name
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'noname@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'pass' } });
    fireEvent.submit(screen.getByPlaceholderText('Email').closest('form')!);

    await waitFor(() => {
      expect(mockSignUp.email).toHaveBeenCalledWith({
        email: 'noname@example.com',
        password: 'pass',
        name: '',
      });
    });
  });

  it('displays error when sign in fails with error response', async () => {
    mockSignIn.email.mockResolvedValue({ error: { message: 'Invalid credentials' } });

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'bad@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'wrong' } });
    fireEvent.submit(screen.getByPlaceholderText('Email').closest('form')!);

    await waitFor(() => {
      expect(screen.getByText('Authentication failed. Please check your credentials.')).toBeDefined();
    });
  });

  it('displays error when sign in throws', async () => {
    mockSignIn.email.mockRejectedValue(new Error('Network error'));

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'x' } });
    fireEvent.submit(screen.getByPlaceholderText('Email').closest('form')!);

    await waitFor(() => {
      expect(screen.getByText('Authentication failed. Please check your credentials.')).toBeDefined();
    });
  });

  it('displays error when sign in has error with no message', async () => {
    mockSignIn.email.mockResolvedValue({ error: {} });

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'x' } });
    fireEvent.submit(screen.getByPlaceholderText('Email').closest('form')!);

    await waitFor(() => {
      expect(screen.getByText('Authentication failed. Please check your credentials.')).toBeDefined();
    });
  });

  it('does not render error message when error is empty', () => {
    render(<LoginPage />);

    const errorElement = screen.queryByText('Authentication failed. Please check your credentials.');
    expect(errorElement).toBeNull();
  });

  it('shows loading state on submit button', async () => {
    // Make sign in hang
    mockSignIn.email.mockReturnValue(new Promise(() => {}));

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'x' } });
    fireEvent.submit(screen.getByPlaceholderText('Email').closest('form')!);

    await waitFor(() => {
      expect(screen.getByText('Please wait...')).toBeDefined();
    });
  });
});
