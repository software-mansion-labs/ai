---
title: Closing the loop
---

If you want to be efficient while working with agents, you need to _close the loop_. The agent must be able to **continuously** and **autonomously** gather feedback about its work without your intervention!

This section provides some tips on how to make your agent more _agentic_.

## Tests, tests, tests

1. Make sure your agent writes tests for any regression it finds before attempting to fix actual code. If it doesn’t do this by itself, consider telling it so in your AGENTS.md.
2. Pay attention to how models assert the expected state. Many models tend to write leaky assertions, which only catch the exact issue they just reasoned about.

## Backend logs and database access

1. Make your app tee logs to a `*.log` file. This will allow agents to observe runtime behavior. Models are also good at adding their own temporary logs while debugging.
2. Make it easy for an agent to connect to your database via `psql` or `sqlite3`. You can even use this interface in place of database GUIs.
3. Take a look at [tidewave.ai](https://tidewave.ai/).

## Leverage CLIs

1. Models are trained _a lot_ on Bash. They breathe it and are very productive when they can process data through shell one-liners or quick Python scripts.
2. If you build a quick library for some remote API:
   1. Try to make it easy for agents to play with this API.
   2. In a non-interactive language (Go, Rust, Swift, etc.), consider asking your agent to whip up a quick CLI on top of your code.
   3. In JS, Python, Elixir, or Ruby, agents can efficiently use REPLs or one-off scripts.

Also, take a look at these skills:

- [https://skills.sh/mitsuhiko/agent-stuff/tmux](https://skills.sh/mitsuhiko/agent-stuff/tmux) - useful if you make/use interactive CLIs. Agents are pretty good at using GDB/LLDB via tmux.

## Automating web frontend QA

Current frontier models are surprisingly capable of browsing websites, clicking around, and observing what happens, provided they are given the right tools.

Try using one of these tools:

- [Cursor Browser](https://cursor.com/docs/agent/browser)
- [Agent Browser](https://skills.sh/vercel-labs/agent-browser/agent-browser)
- [Claude for Chrome](https://claude.com/chrome)

Make it easy for agents to spawn a new instance of the app by themselves. Ideally on a separate port so that multiple agents can work in parallel.

Also, take a look at these skills:

- [https://skills.sh/vercel-labs/agent-skills/vercel-react-best-practices](https://skills.sh/vercel-labs/agent-skills/vercel-react-best-practices)

## Automating mobile app QA

You can also tell the agent to play with a phone simulator.

Take a look at:

- [Radon AI](https://radon.swmansion.com/docs/features/radon-ai)
- [XcodeBuildMCP](https://www.xcodebuildmcp.com/)
- [Agent Device](https://github.com/callstackincubator/agent-device)

Also, have a look at these skills:

- [https://skills.sh/expo/skills](https://skills.sh/expo/skills)
- [https://skills.sh/callstackincubator/agent-skills/react-native-best-practices](https://skills.sh/callstackincubator/agent-skills/react-native-best-practices)
