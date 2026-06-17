import fs from "fs";
import path from "path";

const slug = process.argv[2];

if (!slug) {
  console.error("Usage: npm run new-project <slug>");
  process.exit(1);
}

const title = slug
  .split("-")
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  .join(" ");

const projectDir = path.join(process.cwd(), "projects", slug);

if (fs.existsSync(projectDir)) {
  console.error(`Project already exists: ${slug}`);
  process.exit(1);
}

fs.mkdirSync(projectDir, { recursive: true });

const today = new Date().toISOString().split("T")[0];

const metadata = {
  title,
  slug,
  status: "in-progress",
  dateCreated: today,
  dateUpdated: today,
  description: "",
  summary: "",
  featured: false,
  tags: [],
  links: {},
};

fs.writeFileSync(
  path.join(projectDir, "metadata.json"),
  JSON.stringify(metadata, null, 2),
);

fs.writeFileSync(
  path.join(projectDir, "content.mdx"),
  `## The idea

Describe the spark for this project.

## Why it exists

What problem, curiosity, or itch made it worth building?

## Current shape

What exists right now?

## Notes

What changed while building? What did you learn?

## Next

What would make the project more useful, complete, or interesting?
`,
);

console.log(`Created project: ${slug}`);
