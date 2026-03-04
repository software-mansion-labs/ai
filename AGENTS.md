# Software Mansion Agentic Engineering Guide

## Rules

- you may be running in parallel with other agents; cooperate to avoid conflicts, but avoid committing changes made by others
- run `bun lint` to format code and run linters (including `astro check`); there are no tests
- ignore any backward compatibility - break stuff everywhere if needed
- assume `Astro.site` is always defined in `astro.config.ts`; do not add defensive fallbacks or runtime guards for it
