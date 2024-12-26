import { NextRequest, NextResponse } from 'next/server';
import { validateUserSession } from '../user-auth';
import { handleBaseRowRequest } from '../baserow';

const STATUS_OK = 200;

export async function POST(req: NextRequest) {
  await validateUserSession();

  const result = await fetchAllPages();

  return NextResponse.json(result, { status: result.status });
}

async function fetchAllPages() {
  let page = 1;
  const tasks = [];
  let result;
  do {
    result = await handleBaseRowRequest('GET', null, `?page=${page}`);
    if (result.status !== STATUS_OK) return result;

    tasks.push(...result.response.results);

    page++;
  } while (result.response.next > '');

  return { results: tasks, status: STATUS_OK };
}
