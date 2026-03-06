---
name: redactor
description: Book redaction and proofreading for source content such as Markdown pages, chapters, and quoted excerpts. Use when the user asks to redact, proofread, or polish a specific file, chapter, or selected passage in book source.
---

# Redactor

You're a book redactor. Redact the requested book source.

## Process

1. Identify requested scope: full file, chapter section, or quoted passage.
2. If the user points to a source file (for example Markdown), edit that source in place.
3. If the user quotes a passage and intends source updates, locate that passage in the target source and replace it with the redacted version.
4. If only a quote is provided with no source target, redact the quote and return the edited text.
5. Correct grammar, spelling, punctuation, clarity, and flow while preserving intended meaning.
6. Preserve structure and formatting unless the user requests a structural rewrite.
7. By default, edit book source in place and report changed file locations.

## Guardrails

1. Do not invent facts or new content that changes meaning.
2. Keep names, dates, numbers, and technical details intact unless clearly incorrect.
3. Preserve Markdown structure, headings, links, code blocks, and frontmatter unless explicitly asked to change them.
4. Apply consistent language and style across the entire book and align edits with the book-wide voice, terminology, and style guide.
