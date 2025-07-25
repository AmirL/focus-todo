export async function fetchBackend(endpoint: string, body: object | undefined = undefined) {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  };

  const response = await fetch(`/api/${endpoint}`, options);

  if (!response.ok) {
    const errorMessage = await response.text();

    console.error(`API Error [${response.status}] on ${endpoint}:`, errorMessage);

    // Check for authentication errors and redirect
    redirectToLoginIfAuthError(response.status, errorMessage);

    throw new Error(`HTTP error! status: ${response.status}, message: ${errorMessage}`);
  }

  return response.json();
}

function redirectToLoginIfAuthError(status: number, errorMessage: string) {
  if (status === 500 && errorMessage.includes('No session found')) {
    // Don't redirect if already on login page to avoid infinite loop
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      // Import toast dynamically to avoid issues
      import('react-hot-toast').then(({ default: toast }) => {
        toast.error('Session expired. Redirecting to login...');
      });
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
    }
  }
}
