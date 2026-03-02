---
title: Expanding Horizons
---

## In this chapter you will

- Build stronger mental models for context windows and thread behavior.
- Understand prompt caching and compaction in practical terms.
- Compare model tendencies and tradeoffs for real engineering tasks.
- Get a pragmatic view of where MCP fits in your workflow.

## Threads, context, and caching

### From thread to model input

Models are still just glorified autocomplete. What agent harnesses do is structure agent threads as model inputs (i.e., input strings). Almost every existing harness roughly follows the same framework. It’s dead simple:

![](../../assets/thread-diagram.svg)

You might ask: what is the context window, then? It is just the maximum length of the input string that the model can ingest. Agent harnesses often reduce this window slightly from actual model limits to reserve space for some tail system messages or a compaction prompt.

Now (especially if you’re going to work with Anthropic models), go read this article: [https://ampcode.com/notes/200k-tokens-is-plenty](https://ampcode.com/notes/200k-tokens-is-plenty). The author wrote a great overview of context peculiarities and how models behave as context usage grows. TL;DR: Keep your threads short.

### Prompt caching

TL;DR: Prompt caching is an optimization for LLM APIs that lets the model _reuse previously computed internal context_ (especially the prefix of prompts like system instructions or examples), so repeated similar requests don’t have to be processed from scratch.

- [https://x.com/trq212/status/2024574133011673516?s=12](https://x.com/trq212/status/2024574133011673516?s=12)
- [https://platform.openai.com/docs/guides/prompt-caching](https://platform.openai.com/docs/guides/prompt-caching?utm_source=chatgpt.com)

### Compaction

TL;DR: Compaction extends the effective context length for long-running conversations and tasks by automatically summarizing older context when approaching the context window limit. Compaction keeps the active context focused and performant by replacing stale content with concise summaries.

- [https://platform.claude.com/docs/en/build-with-claude/compaction](https://platform.claude.com/docs/en/build-with-claude/compaction)
- [https://developers.openai.com/api/docs/guides/compaction](https://developers.openai.com/api/docs/guides/compaction)
- [Client-side compaction system prompt used by Pi agent harness](https://github.com/badlogic/pi-mono/blob/380236a003ec7f0e69f54463b0f00b3118d78f3c/packages/coding-agent/src/core/compaction/compaction.ts#L444-L475)

## Some words about models

### Where to access free models

- **ChatGPT Codex**: Available on the free plan until April 2nd, 2026.

- **[Amp](https://ampcode.com/)**: Free usage of $10/day is provided if you signed up before February 10th, 2026. Otherwise, pricey.

- **[OpenCode Zen](https://opencode.ai/docs/zen/)**: They always have some Chinese or xAI model available for free, though conversations are sent to vendors as training data. All models are hosted in the USA.

### Frontier model comparison

- **Claude Opus**
  - Decent creativity, can present with an engaging personality.
  - Tends not to read enough context, so it can hallucinate.
  - RL-trained heavily to follow instructions and perform tool calls.
  - Very expensive per token. Use short threads because cost grows quickly as thread length increases and cache gets pruned over time.

- **GPT**
  - Workhorse, RL-trained to gather a lot of context before answering, so slower but tends to generate the most "in-place" code.
  - Cheapest cost per token.
  - Codex variants have great compaction algorithms, and they can reliably work over long threads.

- **Gemini**
  - Looks very creative and brilliant, but the models can be unreliable (they tend to ignore instructions).

- **Chinese models**
  - MiniMax, Kimi, Qwen, etc. Very cheap. MiniMax M2.5 is very close to the frontier.
  - Smaller versions are often open-source.
  - Be careful to use US/EU inference providers only; check out [OpenCode Zen](https://opencode.ai/docs/zen/), as they host all models in the USA; avoid routing sensitive work through providers in other jurisdictions.

## A few words about MCP

MCP is a tricky beast, and it was actually hard for us to find a good place for it in this workbook.

MCP is a protocol through which AI applications can connect to data sources (local and remote), tools (applications and services), and workflows (specialized subagents).

MCP is often mentioned along with skills - but they’re not the same. Truth is, 99% of problems can be solved equally well through MCPs, skills, or plain CLIs.

One cool property of MCP is that it solves auth - you can easily authenticate to MCP services using API keys or OAuth with great UX provided by your harness. But MCP also has downsides, such as higher context pollution (try it yourself: load GitHub MCP and see how much context is already lost in a fresh thread). Claude Code is experimenting with countermeasures to this problem, but funnily enough, you can also wrap any MCP in a skill (through [mcporter](https://github.com/steipete/mcporter/)).

So to answer the question: when should you use MCP, a skill, or a CLI? If possible, try all three and do whatever works best for you and your agents.

## What to read next

If you want to stay sharp in agentic engineering, subscribe to these recommended feeds:

### Independent voices

- [Simon Willison's Blog](https://simonwillison.net/)
- [Thorsten Ball's Joy & Curiosity Newsletter](https://registerspill.thorstenball.com/)
- [Armin Ronacher's Blog](https://lucumr.pocoo.org/)
- [Mitchell Hashimoto's Blog](https://mitchellh.com/)

### Product and engineering blogs

- [OpenAI Engineering News](https://openai.com/news/engineering/)
- [Claude Code Blog](https://claude.com/blog/category/claude-code)
- [Cursor Blog](https://cursor.com/blog)
- [Amp News](https://ampcode.com/news)

---
