import fs from "fs";
import path from "path";

const slug = process.argv[2];

if (!slug) {
  console.error("Usage: npm run new-experiment <slug>");
  process.exit(1);
}

const title = slug
  .split("-")
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  .join(" ");

const experimentDir = path.join(process.cwd(), "experiments", slug);

if (fs.existsSync(experimentDir)) {
  console.error(`Experiment already exists: ${slug}`);
  process.exit(1);
}

fs.mkdirSync(experimentDir, { recursive: true });

const metadata = {
  title,
  slug,
  status: "in-progress",
  week: null,
  dateCreated: new Date().toISOString().split("T")[0],
  description: "",
  tags: [],
};

fs.writeFileSync(
  path.join(experimentDir, "metadata.json"),
  JSON.stringify(metadata, null, 2)
);

fs.writeFileSync(
  path.join(experimentDir, "page.tsx"),
`import Link from "next/link";

export default function ${title.replaceAll(" ", "")}Experiment() {
  return (
    <main className="min-h-screen p-8">
      <Link href="/" className="text-sm underline">
        Back to Labs
      </Link>

      <section className="mt-12 max-w-3xl">
        <p className="text-sm uppercase tracking-wide opacity-60">
          AI Experiment
        </p>

        <h1 className="mt-3 text-5xl font-bold">
          ${title}
        </h1>

        <p className="mt-6 text-lg opacity-80">
          Experiment in progress.
        </p>
      </section>
    </main>
  );
}
`
);

console.log(`Created experiment: ${slug}`);
