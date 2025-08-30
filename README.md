This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## API Access

Generate an API key in Settings → API Keys, then call the read-only tasks endpoint with the key. API keys are hashed server-side and can be revoked in Settings.

Requirements:
- Set `API_KEY_SECRET` in your environment. The server throws if it is not set.

Endpoint:
- `GET /api/tasks`

Headers (choose one):
- `Authorization: Bearer <api_key>`
- `X-Api-Key: <api_key>`

Query params (by task `date`):
- `on`: `YYYY-MM-DD` or `today` or `tomorrow` (filters to that day)
- `since`: ISO date; filters `date > since`
- `until`: ISO date; filters `date < until`
- `listId`: number; filters by list
- `includeDeleted`: `true|false` (default `false`)
- `includeRecentlyDeleted`: `true|false` (deleted within last 24h)
- `completed`: `true|false`
- `limit`: 1–500 (default 100)

Examples:

```bash
curl -s \
  -H "Authorization: Bearer $API_KEY" \
  "https://your.app/api/tasks?since=2025-01-01T00:00:00Z&limit=200"

curl -s \
  -H "X-Api-Key: $API_KEY" \
  "https://your.app/api/tasks?listId=3&includeRecentlyDeleted=true"

# Query tasks for tomorrow
curl -s \
  -H "Authorization: Bearer $API_KEY" \
  "https://your.app/api/tasks?on=tomorrow"
```
