const BASEROW_TOKEN = process.env.BASEROW_TOKEN;
const TABLE_ID = 379718;
const API_URL = `https://api.baserow.io/api/database/rows/table/${TABLE_ID}`;

export async function handleBaseRowRequest(method: string, body: object | null, endpoint: string) {
  try {
    console.log(`Sending API request to Baserow: ${method} ${API_URL}/${endpoint}`, body);
    const { ok, data, status } = await sendApiRequest(method, body, endpoint);

    if (!ok) {
      return { response: { error: data }, status };
    }

    const parsed = method !== 'DELETE' ? JSON.parse(data) : { ok: true };

    return { response: parsed, status: 200 };
  } catch (error) {
    if (!(error instanceof Error)) return { response: { error: 'Unknown error' }, status: 500 };

    console.error(`API request failed: ${error.message ?? ''}`);
    return { response: { error: error.message }, status: 500 };
  }
}

async function sendApiRequest(method: string, body: object | null, endpoint: string) {
  const options = {
    method,
    headers: {
      Authorization: `Token ${BASEROW_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  };

  const response = await fetch(`${API_URL}/${endpoint}`, options);
  const data = await response.text();
  return { ok: response.ok, data, status: response.status };
}
