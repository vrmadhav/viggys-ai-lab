import fs from "fs";
import path from "path";

const slug = process.argv[2];

if (!slug) {
  console.error("Usage: npm run new-episode <slug>");
  process.exit(1);
}

const title = slug
  .split("-")
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  .join(" ");

const episodeDir = path.join(process.cwd(), "experiments", slug);

if (fs.existsSync(episodeDir)) {
  console.error(`Episode already exists: ${slug}`);
  process.exit(1);
}

fs.mkdirSync(episodeDir, { recursive: true });

const metadata = {
  title,
  slug,
  episode: null,
  status: "in-progress",
  dateCreated: new Date().toISOString().split("T")[0],
  description: "",
  idea: "",
  promptUrl: "",
  popular: false,
  tags: [],
  tracks: {
    promptOnly: { url: "", status: "planned" },
    designThinking: { url: "", status: "planned" },
  },
};

fs.writeFileSync(
  path.join(episodeDir, "metadata.json"),
  JSON.stringify(metadata, null, 2),
);

fs.writeFileSync(
  path.join(episodeDir, "content.mdx"),
  `## The idea

Describe the spark for this episode.

## The prompt

How the idea became a researched prompt, and what that prompt asked for.

## Prompt-Only build

What AI produced when handed the prompt alone.

## Design-Thinking build

What changed once real user research and design thinking were applied.

## The verdict

Did design make the difference? What did this episode teach us?
`,
);

console.log(`Created episode: ${slug}`);
