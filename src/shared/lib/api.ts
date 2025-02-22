import toast from 'react-hot-toast';

export async function fetchBackend(endpoint: string, body: object | undefined = undefined) {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  };

  console.log('endpoint', endpoint);
  try {
    const response = await fetch(`/api/${endpoint}`, options);
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorMessage}`);
    }
    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      toast.error(`API request failed: ${error.message ?? ''}`);
      console.error(`API request failed: ${error.message ?? ''}`);
    }
    throw error;
  }
}
