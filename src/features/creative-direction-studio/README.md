# Creative Direction Studio

Creative Direction Studio turns unstructured project context into an editable Working Intent, then into three distinct Creative Directions. A server-side Prompt Compiler translates a chosen direction into a provider-neutral image request. The UI never constructs provider prompts and never receives credentials.

## Product flow

1. Add freeform context; the mock creative-director service preserves and interprets each contribution.
2. Edit or remove concise Working Intent statements.
3. Explore three strategies: human/observational, object/symbolic, and graphic/systemic.
4. Generate all three previews independently and concurrently.
5. Select, reject, combine, recommend, or react in natural language.
6. Refine a direction, lock decisions, restore older images, or branch from a prior result.

## Run locally

```bash
pnpm dev
```

The default is the mock provider. It adds realistic latency and returns deterministic, visibly labeled SVG placeholders.

For real generation, create an ignored `.env.local`:

```bash
IMAGE_PROVIDER=openai
OPENAI_API_KEY=your-key
OPENAI_IMAGE_MODEL=gpt-image-1.5
```

Restart the development server after changing environment variables. `OPENAI_IMAGE_MODEL` is optional and centralizes the model choice.

## Provider selection

- `IMAGE_PROVIDER=mock`: always use deterministic mock output.
- `IMAGE_PROVIDER=openai` with a key: use the official OpenAI SDK on the server.
- `IMAGE_PROVIDER=openai` without a key in development: fall back to mock and show the fallback in diagnostics.
- Missing OpenAI production configuration: return a safe administrative error; never silently mock.

Providers implement `ImageGenerationProvider` in `server/image-providers`. To add one, implement `id`, `isAvailable`, and `generate`, normalize its result, then add it to `selectImageProvider`. Provider-specific parameters stay behind that boundary.

## Prompt Compiler

`lib/prompt-compiler.ts` combines the direction thesis, structured key decisions, Working Intent, constraints, rejected traits, decision locks, and the current revision. It converts the requested format to a supported size and avoids ornamental prompt filler. Every generated image retains the compiled prompt for inspection and debugging.

## Current service boundaries and limitations

- GPT Image generation is real when OpenAI is configured.
- Intent interpretation, direction generation, evaluation, and refinement use schema-validated deterministic mock services. They are isolated so a real language model can replace them without changing the UI.
- Text context is fully supported. No upload or vision layer exists in the archive, so image references are intentionally not presented as interpreted.
- Session metadata is stored in local storage. Generated images, base64 payloads, and temporary URLs remain in memory and disappear on refresh.
- There is no durable image storage, authentication, collaboration, server-side session database, cancellation endpoint, or analytics vendor. A content-safe event hook is provided.

