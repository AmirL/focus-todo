export async function fetchBackend(endpoint: string, body: object | undefined = undefined) {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  };

  console.log('endpoint', endpoint);
  const response = await fetch(`/api/${endpoint}`, options);

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, message: ${errorMessage}`);
  }

  return response.json();
}
