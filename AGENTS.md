# Software Mansion Agentic Engineering Guide

## Rules

- you may be running in parallel with other agents; cooperate to avoid conflicts, but avoid committing changes made by others
- run `bun lint` to format code and run linters; there are no tests
- ignore any backward compatibility - break stuff everywhere if needed

## Git

- only commit what has changed in the current thread, don't commit parallel agent's work
- if you see unexpected changes, leave them as-is
- short, imperative commit titles (e.g., "add game server S3 bucket")
- detailed commit descriptions telling:
- context behind the changes: what, how and why,
- manual testing steps,
- special considerations.
- if commit is meant to fix an issue, add `fix #123` at the end of the commit message.
