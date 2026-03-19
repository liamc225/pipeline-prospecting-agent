import test from "node:test";
import assert from "node:assert/strict";
import { resolveSearchProvider } from "../lib/enrichment";

test("resolveSearchProvider prefers explicit exa selection", () => {
  assert.equal(resolveSearchProvider("exa", true, true), "exa");
});

test("resolveSearchProvider prefers explicit tavily selection", () => {
  assert.equal(resolveSearchProvider("tavily", true, true), "tavily");
});

test("resolveSearchProvider defaults to tavily when both keys are present", () => {
  assert.equal(resolveSearchProvider(undefined, true, true), "tavily");
});

test("resolveSearchProvider falls back to exa when only exa is configured", () => {
  assert.equal(resolveSearchProvider(undefined, true, false), "exa");
});

test("resolveSearchProvider rejects unsupported providers", () => {
  assert.throws(
    () => resolveSearchProvider("google", true, true),
    /Unsupported SEARCH_PROVIDER/
  );
});

test("resolveSearchProvider rejects exa without a key", () => {
  assert.throws(
    () => resolveSearchProvider("exa", false, true),
    /EXA_API_KEY is required/
  );
});

test("resolveSearchProvider rejects missing search configuration", () => {
  assert.throws(
    () => resolveSearchProvider(undefined, false, false),
    /Set TAVILY_API_KEY or EXA_API_KEY/
  );
});
