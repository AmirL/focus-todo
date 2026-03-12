'use client';

import { useState } from 'react';
import { signIn, signUp } from '@/shared/lib/auth-client';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
// Types
interface AuthFormData {
  email: string;
  password: string;
  name?: string;
}

// Use a hard navigation to ensure the browser sends the newly-set session cookie.
// Next.js router.push() does a soft navigation where the middleware may not see
// cookies set by a recent fetch response, causing the first login click to fail.
function redirectAfterLogin() {
  window.location.href = '/';
}

// Custom hook for authentication logic
function useAuthentication() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const authenticate = async (data: AuthFormData, isSignUp: boolean) => {
    setIsLoading(true);
    setError('');

    try {
      let result;
      if (isSignUp) {
        // Ensure name is provided for sign up
        result = await signUp.email({
          ...data,
          name: data.name || '',
        });
      } else {
        result = await signIn.email({
          email: data.email,
          password: data.password,
        });
      }

      if (result?.error) {
        throw new Error(result.error.message || 'Authentication failed');
      }

      redirectAfterLogin();
    } catch (error) {
      console.error('Auth error:', error);
      setError('Authentication failed. Please check your credentials.');
      setIsLoading(false);
    }
  };

  const authenticateTestUser = async () => {
    setIsLoading(true);
    setError('');

    try {
      // First try to sign in with existing user
      const signInResult = await signIn.email({
        email: 'test@example.com',
        password: 'password123',
      });

      if (signInResult?.error) {
        throw new Error(`Sign in failed: ${signInResult.error.message || 'Unknown error'}`);
      }

      redirectAfterLogin();
    } catch (signInError) {
      // If sign in fails, try to create the user
      try {
        const signUpResult = await signUp.email({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        });

        if (signUpResult?.error) {
          throw new Error(`Sign up failed: ${signUpResult.error.message || 'Unknown error'}`);
        }

        redirectAfterLogin();
      } catch (signUpError) {
        console.error('Test user creation failed:', signUpError);
        setError(`Test user login failed: ${signUpError instanceof Error ? signUpError.message : 'Unknown error'}`);
        setIsLoading(false);
      }
    }
  };

  return {
    isLoading,
    error,
    authenticate,
    authenticateTestUser,
  };
}

// Error display component
function ErrorMessage({ error }: { error: string }) {
  if (!error) return null;

  return (
    <div className="text-sm text-red-600 text-center bg-red-50 p-2 rounded">
      {error}
    </div>
  );
}

// Form fields component
function AuthFormFields({ 
  isSignUp, 
  formData, 
  onChange 
}: { 
  isSignUp: boolean;
  formData: AuthFormData;
  onChange: (field: keyof AuthFormData, value: string) => void;
}) {
  return (
    <>
      {isSignUp && (
        <div>
          <Input
            type="text"
            placeholder="Full name"
            value={formData.name || ''}
            onChange={(e) => onChange('name', e.target.value)}
            required
          />
        </div>
      )}
      <div>
        <Input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => onChange('email', e.target.value)}
          required
        />
      </div>
      <div>
        <Input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => onChange('password', e.target.value)}
          required
        />
      </div>
    </>
  );
}

// Mode toggle component
function AuthModeToggle({ 
  isSignUp, 
  onToggle 
}: { 
  isSignUp: boolean; 
  onToggle: () => void; 
}) {
  return (
    <div className="text-center text-sm">
      {isSignUp ? (
        <span>
          Already have an account?{' '}
          <button
            type="button"
            className="underline"
            onClick={onToggle}
          >
            Sign in
          </button>
        </span>
      ) : (
        <span>
          Don&apos;t have an account?{' '}
          <button
            type="button"
            className="underline"
            onClick={onToggle}
          >
            Sign up
          </button>
        </span>
      )}
    </div>
  );
}

// Test user button component
function TestUserButton({ 
  onTestLogin, 
  isLoading 
}: { 
  onTestLogin: () => void; 
  isLoading: boolean; 
}) {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Button 
      variant="secondary" 
      onClick={onTestLogin} 
      disabled={isLoading}
      className="w-full"
    >
      🧪 Login as Test User (Dev Only)
    </Button>
  );
}

// Main login page component
export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    name: '',
  });

  const { isLoading, error, authenticate, authenticateTestUser } = useAuthentication();

  const handleFormDataChange = (field: keyof AuthFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await authenticate(formData, isSignUp);
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isSignUp ? 'Create Account' : 'Sign In'}</CardTitle>
          <CardDescription>
            {isSignUp 
              ? 'Create a new account to get started' 
              : 'Sign in to your account to continue'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <AuthFormFields 
              isSignUp={isSignUp}
              formData={formData}
              onChange={handleFormDataChange}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          <ErrorMessage error={error} />

          <TestUserButton 
            onTestLogin={authenticateTestUser}
            isLoading={isLoading}
          />

          <AuthModeToggle 
            isSignUp={isSignUp}
            onToggle={toggleMode}
          />
        </CardContent>
      </Card>
    </div>
  );
}