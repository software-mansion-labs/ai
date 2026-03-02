---
title: Becoming Productive
description: Apply prompting and execution patterns that improve reliability, speed, and quality at scale.
---

## In this chapter you will

- Learn prompting and execution patterns for non-trivial tasks.
- Improve feedback loops so agents can validate work autonomously.
- Use workflows that make parallel, high-throughput work safer.
- Reduce quality regressions when scaling agentic engineering.

## Prompting Techniques

### A good thread structure

If you want a baseline for what decent threads for non-trivial tasks should look like, try this framework.

:::note
This is not a strict scheme you must follow exactly. Phases can be optional or merged. This can all be done in a single thread or in many smaller ones, with past thread references (e.g., `@Past Chat` in Cursor, `@@` in Amp), intermediary Markdown files, or a harness’s handoff feature as means of carrying valuable information.
:::

1. **Brainstorm** - converse with an agent about how a task (or a part of it) can be done. The goal here is to gather information and collect it in one place. You can run several brainstorming sessions at once and produce summary `*.md` files as outcomes.
2. **Plan** - go into _plan_ mode and work out a good implementation outline with an agent. Talk to it and refine the plan until it’s 👌
3. **Execute** - when your agent (not you!) knows how the task should be done, tell it to do it!
4. **Agent review** - many harnesses have built-in auto-review features. Try using them in the background so the agent spends time finding all the stupid mistakes, not you (you should be doing more valuable work in the meantime).
5. **Human review** - ultimately, you (a human) are responsible for the code. Invest some time in reviewing it so that (a) you know what’s happening and (b) you won’t waste reviewers’ time.
6. **Agent self-improvement** - talk to your agent: How can you both improve your workflow? What lessons can you learn from recent work? Perhaps some AGENTS.md rule or a new skill needs to be created?
   1. _If you use Claude Code, try the `/insights` command._
   2. _Use your harness's memory feature (e.g., `/memory` in Claude Code, Memories in Cursor) to persist lessons learned across sessions._
   3. _Try post-mortem diffs: ask the agent to compare its first attempt vs the final version and explain what it got wrong. Great for spotting recurring antipatterns._

### Red/green TDD

TL;DR: Write tests first, confirm they fail (red), then implement until they pass (green); a strong fit for coding agents because it reduces broken or unused code and builds a robust test suite.
[https://simonwillison.net/guides/agentic-engineering-patterns/red-green-tdd/](https://simonwillison.net/guides/agentic-engineering-patterns/red-green-tdd/)

### Multimodal input

Screenshot a bug or broken UI in your app. Or record a short video of something changing over time. Drop it into the prompt and say “fix it”. You can even add arrows and annotations in your screenshot tool. GPT-5.3-Codex and Gemini 3.1 Pro handle multimodal input very well; Opus 4.6 is a bit weaker here.

### Socratic prompting

TL;DR: Instead of giving the answer, ask questions that lead the agent to reach it themselves. Example: Rather than “The bug is in the condition,” ask “What are the assumptions?”, “Is this condition always true?”, and “What happens for the edge case?” Goal: surface assumptions, check logic, and arrive at the conclusion through one’s own reasoning.
[https://platform.claude.com/docs/en/resources/prompt-library/socratic-sage](https://platform.claude.com/docs/en/resources/prompt-library/socratic-sage)

### Underprompting

Intentionally omit some element of the prompt so that:

1. The agent explores that area more thoroughly in its own way.
2. You can see what’s missing in AGENTS.md / codebase / docs from what the agent tried to read.

### Borrowing from other code

If you know you’re working on a problem that has been solved somewhere else, tell your agent to find and borrow the solution.

- If this is open-source code, you can tell it to clone it into `/tmp`.
- There is also [https://mcp.grep.app](https://mcp.grep.app) if you’re just looking for code snippets.
- Beware of legal (copyright) concerns!

Depending on the codebase, a useful pattern is to have several _golden_ files that the agent can use as references.

- For example, if you have a component library, tell the agent to follow the implementation of the `ui/Button.tsx` component.
- If you're doing repetitive module refactoring, make the changes in one golden module, then ask the agent to reproduce them in other modules.

### Walkthroughs

TL;DR: You can tell your agent to explain to you in human language what happens in the code, or to help you review its work by letting the agent showcase it. Example prompt:

```md
Read the source and then plan a linear walkthrough of the code that explains how
it all works in detail. Then create a walkthrough.md file in the repo and build
the walkthrough in there, using Mermaid diagrams and commentary notes or whatever
you need. Include snippets of code you are talking about.
```

- [https://simonwillison.net/guides/agentic-engineering-patterns/linear-walkthroughs/](https://simonwillison.net/guides/agentic-engineering-patterns/linear-walkthroughs/)
- [https://ampcode.com/news/walkthrough](https://ampcode.com/news/walkthrough)

### Put a human in the loop

Ask the agent to prepare a step-by-step reproduction of a complex manual flow (what to click, in what order); you perform the steps (e.g., log in to the browser with your account), report back, and the agent continues or verifies. Like augmented manual QA: the agent scripts the scenario, and the human does the sensitive or interactive bits.

### Models are good at Git

You can tell your agent:

1. To make a commit.
2. To create a branch/worktree or check out some repo to `/tmp`.
3. To submit a PR.
4. To merge/rebase and fix conflicts (make sure to back up, or ask the agent to use `git reflog` in bad scenarios).
5. To use the `gh` CLI to read issues/PR comments or GitHub Actions logs.

### Reverse engineer

Agents are surprisingly good at reverse engineering apps. Minified/compiled code is not such a big cognitive burden for them, and they have broad knowledge of useful tools in this space.

Try pointing your agent at some website or Android APK where there’s something you want to mimic. Initially, you may need to interactively install some tools that the agent would like to use.

### Issue pinpointer

Got a huge log file, maybe a screenshot, and you need to identify the bug? Paste everything you have into your agent prompt and tell it to find the exact log lines itself.

## Closing the loop

If you want to be efficient while working with agents, you need to _close the loop_. The agent must be able to **continuously** and **autonomously** gather feedback about its work without your intervention!

This section provides some tips on how to make your agent more _agentic_.

### Tests, tests, tests

1. Make sure your agent writes tests for any regression it finds before attempting to fix actual code. If it doesn’t do this by itself, consider telling it so in your AGENTS.md.
2. Pay attention to how models assert the expected state. Many models tend to write leaky assertions, which only catch the exact issue they just reasoned about.

### Backend logs and database access

1. Make your app tee logs to a `*.log` file. This will allow agents to observe runtime behavior. Models are also good at adding their own temporary logs while debugging.
2. Make it easy for an agent to connect to your database via `psql` or `sqlite3`. You can even use this interface in place of database GUIs.
3. Take a look at [tidewave.ai](https://tidewave.ai/).

### Leverage CLIs

1. Models are trained _a lot_ on Bash. They breathe it and are very productive when they can process data through shell one-liners or quick Python scripts.
2. If you build a quick library for some remote API:
   1. Try to make it easy for agents to play with this API.
   2. In a non-interactive language (Go, Rust, Swift, etc.), consider asking your agent to whip up a quick CLI on top of your code.
   3. In JS, Python, Elixir, or Ruby, agents can efficiently use REPLs or one-off scripts.

Also, take a look at these skills:

- [https://skills.sh/mitsuhiko/agent-stuff/tmux](https://skills.sh/mitsuhiko/agent-stuff/tmux) - useful if you make/use interactive CLIs. Agents are pretty good at using GDB/LLDB via tmux.

### Automating web frontend QA

Current frontier models are surprisingly capable of browsing websites, clicking around, and observing what happens, provided they are given the right tools.

Try using one of these tools:

- [https://cursor.com/docs/agent/browser](https://cursor.com/docs/agent/browser)
- [https://skills.sh/vercel-labs/agent-browser/agent-browser](https://skills.sh/vercel-labs/agent-browser/agent-browser)
- [https://claude.com/chrome](https://claude.com/chrome)

Make it easy for agents to spawn a new instance of the app by themselves. Ideally on a separate port so that multiple agents can work in parallel.

Also, take a look at these skills:

- [https://skills.sh/vercel-labs/agent-skills/vercel-react-best-practices](https://skills.sh/vercel-labs/agent-skills/vercel-react-best-practices)

### Automating mobile app QA

You can also tell the agent to play with a phone simulator.

Take a look at:

- [Radon AI](https://radon.swmansion.com/docs/features/radon-ai)
- [XcodeBuildMCP](https://www.xcodebuildmcp.com/)

Also, have a look at these skills:

- [https://skills.sh/expo/skills](https://skills.sh/expo/skills)
- [https://skills.sh/callstackincubator/agent-skills/react-native-best-practices](https://skills.sh/callstackincubator/agent-skills/react-native-best-practices)

## Going 10x

Agentic engineering is like multicore CPUs. Agents aren’t always faster than humans (sometimes they are, for sure). But a single human can control several agents in parallel, and that’s where the productivity speedup comes from. This page contains tips on how to deal with this effectively.

### Conflict management

1. The most popular option is to have each parallel agent run in a Git worktree.
   1. For this to be efficient, your app needs to be easily bootable with a blank or seeded state from a fresh Git checkout.
   2. Many harnesses have built-in worktree management features, but models easily handle prompts such as `do this in a /tmp worktree`.
   3. There's a limitation: each worktree of a single checkout must operate on a different `HEAD` (branch/commit/ref). This might become tedious, especially around the `main` branch…
2. That’s why you can also try keeping several separate full Git checkouts.
3. Or, you can go YOLO and actually have multiple agents operate on a single codebase.
   1. Tell your agents to commit frequently, atomically, and only stage stuff from the current thread.
   2. Avoid invoking tasks that would write to the same parts of the repository.

### Help! My agents are writing spaghetti!!!

This is where vibe coding starts to diverge from agentic engineering. You, as a human, do serious work, and you must be held responsible for it. Models can make a mess because they are rewarded for task completion during training, not long-term architecture. This is (still) a human’s job.

1. Organize the code in rather small modules with strict boundaries, predictable structure, and well-defined input/output.
2. Enforce invariants in code, not only in documentation. Strict types, assertions, and tons of tests are your friend here.
3. Enforce code patterns mechanically. Tell agents to write dedicated linters and CI jobs.
4. What an agent doesn’t see doesn’t exist. Unlike humans, agents have no memory. Make sure all knowledge is either kept in the repository as files or easily reachable through MCP. Periodically verify this knowledge is actually read by agents.

Sounds familiar, doesn’t it? These are standard practices of large-scale engineering. Agentic engineering just amplifies problems. There is only one tip that applies to working with agents, which you’d be unlikely to adopt when working in 100% human teams:

1. Embrace agents’ taste. Models have their own mindsets. If the codebase aligns with this, agents will be able to guess where something is, how to do something, and whether output fits correctly. Do not enforce your stylistic preferences. Check what libraries agents like to use and consider staying with that.

- [https://openai.com/index/harness-engineering/](https://openai.com/index/harness-engineering/)
- [https://bits.logic.inc/p/ai-is-forcing-us-to-write-good-code](https://bits.logic.inc/p/ai-is-forcing-us-to-write-good-code)

---
