import { instanceToPlain } from 'class-transformer';

const BASEROW_TOKEN = 'ZOlzdEhtUxCeeCcBaM0wMZjMuqDuHbZM';
const TABLE_ID = 379718;
const API_URL = `https://api.baserow.io/api/database/rows/table/${TABLE_ID}/`;

export async function apiRequest(endpoint: string, method = 'GET', body: object | undefined = undefined) {
  const options = {
    method,
    headers: {
      Authorization: `Token ${BASEROW_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(instanceToPlain(body)) : undefined,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorMessage}`);
    }
    if (method == 'DELETE') return;
    return response.json();
  } catch (error) {
    if (error instanceof Error) console.error(`API request failed: ${error.message ?? ''}`);
    throw error;
  }
}
