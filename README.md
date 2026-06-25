# Viggy's Lab

A small Next.js site for publishing projects, prototypes, experiments, and build notes.

## Local Development

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Adding A Project

```bash
pnpm new-project my-project-slug
```

Each project lives in `projects/<slug>/` with:

- `metadata.json` for title, status, tags, dates, and links
- `content.mdx` for the project write-up

Supported project links are:

- `demo`
- `github`
- `writeup`
- `video`
