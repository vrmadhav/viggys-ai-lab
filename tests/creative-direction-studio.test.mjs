import assert from "node:assert/strict";
import test from "node:test";
import { compileImagePrompt } from "../src/features/creative-direction-studio/lib/prompt-compiler.ts";
import {
  generateDirectionsMock,
  refineDirectionMock,
  updateIntentMock,
} from "../src/features/creative-direction-studio/server/mock-language-services.ts";
import { MockImageProvider } from "../src/features/creative-direction-studio/server/image-providers/mock-image-provider.ts";

test("freeform context updates intent without erasing earlier decisions", () => {
  const first = updateIntentMock({}, "I need an image about loneliness, but not tragic.");
  const second = updateIntentMock(first.updatedIntent, "The subject should be small in the frame.");

  assert.match(second.updatedIntent.objective, /loneliness/i);
  assert.match(second.updatedIntent.composition, /small in the frame/i);
  assert.ok(second.updatedIntent.rejectedTraits?.length);
});

test("meaningful contradictions are surfaced", () => {
  const result = updateIntentMock(
    { composition: "A distant person, small in the frame" },
    "Make the person intimate and emotionally close.",
  );
  assert.equal(result.status, "clarifying-intent");
  assert.match(result.contradiction?.description ?? "", /intimate.*distant/i);
});

test("direction service creates exactly three conceptually different routes", () => {
  const directions = generateDirectionsMock({ objective: "Communicate human collaboration with AI" });
  assert.equal(directions.length, 3);
  assert.equal(new Set(directions.map((direction) => direction.keyDecisions.visualLanguage)).size, 3);
  assert.deepEqual(directions.map((direction) => direction.title), [
    "The Human Distance",
    "The Unsaid Object",
    "The Broken Signal",
  ]);
});

test("prompt compiler includes constraints and locked decisions", () => {
  const direction = generateDirectionsMock({ objective: "A visual about speed" })[0];
  const compiled = compileImagePrompt({
    workingIntent: { objective: "A visual about speed", constraints: ["No cars"], rejectedTraits: ["Glossy advertising"] },
    direction,
    lockedTraits: ["composition"],
    revisionInstruction: "Make the light warmer",
    provider: "mock",
  });

  assert.match(compiled.prompt, /Preserve exactly: composition:/);
  assert.match(compiled.prompt, /Constraints: No cars/);
  assert.match(compiled.prompt, /Avoid: Glossy advertising/);
  assert.match(compiled.prompt, /Revision: Make the light warmer/);
});

test("refinement preserves locked traits and creates a branch", () => {
  const direction = generateDirectionsMock({ objective: "A calm campaign image" })[0];
  const refined = refineDirectionMock(direction, "Center the composition and make the light warmer", ["composition"]);

  assert.equal(refined.keyDecisions.composition, direction.keyDecisions.composition);
  assert.match(refined.keyDecisions.lighting ?? "", /warmer/i);
  assert.deepEqual(refined.parentDirectionIds, [direction.id]);
});

test("mock provider is deterministic and clearly marked", async () => {
  const provider = new MockImageProvider();
  const request = { prompt: "Creative thesis: A quiet distance", parameters: { size: "1024x1024" }, provider: "mock" };
  const [first, second] = await Promise.all([provider.generate(request), provider.generate(request)]);

  assert.equal(first.base64, second.base64);
  assert.equal(first.provider, "mock");
  assert.equal(first.metadata?.mock, true);
});

