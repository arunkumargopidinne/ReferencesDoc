# AI Interview Prep — local development

Quick setup and environment guidance for running the app locally.

Required environment variables
- `OPENAI_API_KEY` — your OpenAI API key (required for AI features)
- `NOTION_TOKEN` — Notion integration token (required to create pages)
- `NOTION_DATABASE_ID` — (optional) Notion database id to create pages in a database
- `OPENAI_MODEL` — (optional) model name, default used if unset

Example `.env.local` (place in project root):

```env
OPENAI_API_KEY=sk-...yourkey...
NOTION_TOKEN=secret_...yourtoken...
NOTION_DATABASE_ID=your-database-id-optional
OPENAI_MODEL=gpt-4o-mini
```

Install and run

```bash
npm install
npm run dev
```

Notes
- The server-side helpers check `OPENAI_API_KEY` at runtime; if the variable is missing, API endpoints that call OpenAI will return an error.
- For a production deployment make sure environment variables are configured in your hosting provider (Vercel, Netlify, etc.).
- The project uses the Next.js App Router; pages live under `app/`.

Next suggested steps
- Wire up Tailwind if you want improved styling (project already includes `globals.css`).
- Improve Notion block conversion to translate Markdown into Notion blocks (currently a simple paragraph is used).
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

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
