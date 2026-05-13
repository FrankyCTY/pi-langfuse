# AGENTS.md

## Project Overview

This repository contains a Pi Coding Agent extension that forwards session activity to Langfuse for observability. The runtime is intentionally small:

- `index.ts`: extension entrypoint, event listeners, trace/span/generation lifecycle, and scoring
- `package.json`: package metadata for Pi/NPM
- `config.json`: local credentials file for manual development only, ignored by git
- `.agents/skills/langfuse/SKILL.md`: local skill instructions for Langfuse-related workflows

## How The Extension Works

The extension listens to Pi lifecycle events and maps them into Langfuse objects:

1. `session_start` captures a stable session id
2. `before_agent_start` creates a trace for the user prompt
3. `tool_call` / `tool_result` create and close tool spans
4. `turn_end` records LLM usage/cost metadata as a generation
5. `agent_end` finalizes the trace and publishes aggregate evaluation scores
6. `session_shutdown` flushes any remaining state

The code is stateful by design. Changes to trace/session bookkeeping should be reviewed carefully because multiple Pi hooks share the same module-level state.

## Local Development

Recommended environment:

- Node.js `>=22` as declared in `package.json`
- A local `config.json` with Langfuse credentials

Typical workflow:

```bash
npm install
pi "test prompt"
```

There is currently no dedicated test suite or `npm` script. When changing behavior, validate by running Pi with the extension enabled and confirming traces, spans, generations, and scores appear in Langfuse.

## Editing Guidance

- Prefer small, behavior-preserving changes in `index.ts`; most bugs here are lifecycle or observability-shape bugs rather than UI issues.
- Keep credential material out of version control. `config.json` should stay local.
- When logging tool input/output, be mindful of payload size and serialization failures.
- If you add new Langfuse fields, verify them against current official docs because the SDK surface evolves.
- Avoid hard-coding install-layout assumptions when importing SDK files unless Pi requires it.

## Review Focus Areas

When reviewing or extending this project, pay extra attention to:

- Trace lifecycle consistency across `before_agent_start`, `agent_end`, and `session_shutdown`
- Correct score attribution at trace level vs observation level
- Defensive handling of unexpected event payload shapes
- Truncation/redaction strategy for large tool payloads
- Compatibility between the installed Langfuse SDK version and any manually declared local TypeScript interfaces
