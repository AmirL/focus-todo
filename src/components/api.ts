import { instanceToPlain } from 'class-transformer';

export async function apiRequest(endpoint: string, method = 'GET', body: object | undefined = undefined) {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ endpoint, method, body: instanceToPlain(body) }),
  };

  try {
    const response = await fetch('/api/proxy', options);
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorMessage}`);
    }
    if (method === 'DELETE') return;
    return response.json();
  } catch (error) {
    if (error instanceof Error) console.error(`API request failed: ${error.message ?? ''}`);
    throw error;
  }
}
