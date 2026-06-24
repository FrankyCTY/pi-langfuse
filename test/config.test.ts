import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import {
  loadConfigFromFile,
  loadConfigFromEnv,
  parseTags,
  parseTraceMetadata,
} from "../src/config.ts";

test("env privacy flags override saved config capture policy", () => {
  const dir = mkdtempSync(join(tmpdir(), "pi-langfuse-config-"));
  const configPath = join(dir, "config.json");
  writeFileSync(
    configPath,
    JSON.stringify({
      publicKey: "pk-lf-test",
      secretKey: "sk-lf-test",
      host: "https://cloud.langfuse.com",
      privacyPreset: "full-debug",
    }),
  );

  const config = loadConfigFromFile(configPath, {
    LANGFUSE_PRIVACY_PRESET: "metadata-only",
    LANGFUSE_CAPTURE_INPUTS: "true",
  });

  assert.deepEqual(config?.capturePolicy, {
    captureInputs: true,
    captureOutputs: false,
    captureToolIo: false,
    captureSystemPrompt: false,
    captureCwd: false,
  });
});

test("parseTags splits and trims a comma-separated list, else undefined", () => {
  assert.deepEqual(parseTags("pi, agent.tool:pi ,product.id:ai-harness"), [
    "pi",
    "agent.tool:pi",
    "product.id:ai-harness",
  ]);
  assert.equal(parseTags(""), undefined);
  assert.equal(parseTags(undefined), undefined);
  assert.equal(parseTags("  ,  "), undefined);
});

test("parseTraceMetadata parses a JSON object and stringifies values, else undefined", () => {
  assert.deepEqual(
    parseTraceMetadata(JSON.stringify({ "product.id": "ai-harness", "product.sha": "45ccdeb" })),
    { "product.id": "ai-harness", "product.sha": "45ccdeb" },
  );
  assert.equal(parseTraceMetadata("not json"), undefined);
  assert.equal(parseTraceMetadata(JSON.stringify(["a", "b"])), undefined);
  assert.equal(parseTraceMetadata(undefined), undefined);
});

test("loadConfigFromEnv reads tracing environment, tags, and metadata", () => {
  const config = loadConfigFromEnv({
    LANGFUSE_PUBLIC_KEY: "pk-lf-test",
    LANGFUSE_SECRET_KEY: "sk-lf-test",
    LANGFUSE_TRACING_ENVIRONMENT: "agent-eval",
    LANGFUSE_TRACE_TAGS: "pi,agent.tool:pi,product.id:ai-harness",
    LANGFUSE_TRACE_METADATA: JSON.stringify({ "product.id": "ai-harness", "product.sha": "45ccdeb" }),
  });

  assert.equal(config?.environment, "agent-eval");
  assert.deepEqual(config?.tags, ["pi", "agent.tool:pi", "product.id:ai-harness"]);
  assert.deepEqual(config?.extraMetadata, { "product.id": "ai-harness", "product.sha": "45ccdeb" });
});

test("trace attributes come from env even when credentials load from config.json", () => {
  const dir = mkdtempSync(join(tmpdir(), "pi-langfuse-config-"));
  const configPath = join(dir, "config.json");
  writeFileSync(
    configPath,
    JSON.stringify({ publicKey: "pk-lf-test", secretKey: "sk-lf-test", host: "https://cloud.langfuse.com" }),
  );

  const config = loadConfigFromFile(configPath, {
    LANGFUSE_TRACING_ENVIRONMENT: "agent-eval",
    LANGFUSE_TRACE_TAGS: "pi,agent.tool:pi",
  });

  assert.equal(config?.environment, "agent-eval");
  assert.deepEqual(config?.tags, ["pi", "agent.tool:pi"]);
});

test("missing trace env vars leave attributes undefined", () => {
  const config = loadConfigFromEnv({
    LANGFUSE_PUBLIC_KEY: "pk-lf-test",
    LANGFUSE_SECRET_KEY: "sk-lf-test",
  });

  assert.equal(config?.environment, undefined);
  assert.equal(config?.tags, undefined);
  assert.equal(config?.extraMetadata, undefined);
});
