export {};

const patchFile = process.argv[2];
if (!patchFile) {
  console.error("Usage: generate-entry.mts <patch_file>");
  process.exit(1);
}

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error("[env] ANTHROPIC_API_KEY not set");
  process.exit(1);
}

const date = process.env.CHANGELOG_DATE;
if (!date) {
  console.error("[env] CHANGELOG_DATE not set");
  process.exit(1);
}

const patch = await Bun.file(patchFile).text();
const systemPrompt = await Bun.file(".github/prompts/changelog.md").text();

const response = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: {
    "x-api-key": apiKey,
    "anthropic-version": "2023-06-01",
    "content-type": "application/json",
  },
  body: JSON.stringify({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system: systemPrompt,
    tools: [
      {
        name: "submit_changelog_entry",
        description: "Submit the changelog entry for the given patch.",
        input_schema: {
          type: "object",
          properties: {
            trivial: {
              type: "boolean",
              description:
                "True if changes are purely cosmetic with no new knowledge for readers.",
            },
            entry: {
              type: "string",
              description:
                "Changelog entry in markdown, starting with ## YYYY-MM-DD heading. Required when trivial is false.",
            },
          },
          required: ["trivial"],
        },
      },
    ],
    tool_choice: { type: "tool", name: "submit_changelog_entry" },
    messages: [{ role: "user", content: `Date: ${date}\n\n${patch}` }],
  }),
});

if (!response.ok) {
  console.error(
    `[anthropic] HTTP ${response.status}: ${await response.text()}`,
  );
  process.exit(1);
}

const body = await response.json();
const toolUse = body?.content?.find(
  (b: { type: string }) => b.type === "tool_use",
);
if (!toolUse) {
  console.error(
    "[anthropic] No tool_use block in response:",
    JSON.stringify(body),
  );
  process.exit(1);
}

process.stdout.write(JSON.stringify(toolUse.input));
