# Software Mansion Agentic Engineering Guide

## Rules

- you may be running in parallel with other agents; cooperate to avoid conflicts, but avoid committing changes made by others
- in markdown, try to put each sentence on a separate line. do not wrap lines after commas.
- run `bun lint` to format code and run linters (including `astro check`), and run `bun run build` before finishing work; there are no tests
- ignore any backward compatibility - break stuff everywhere if needed
- assume `Astro.site` is always defined in `astro.config.ts`; do not add defensive fallbacks or runtime guards for it

## External links

- prefer `<ExternalLink href="..."/>` over `<ExternalLink href="...">manually crafted text</ExternalLink>`.
custom link texts are meant for very rare occasions when a link is not explicitly calling the linked resource.
- as for what link columns to fill in the links.csv file, it depends on kind of linked page:
  - **Landing page**: `title`
  - **Documentation page**: `title`, `author`
  - **Blog post**: `title`, `author`, `date`
  - **GitHub code repository**: `title` (use `organization/repository` for title, not GitHub provided titles), `author`, `date` (use last commit date)
- `<ExternalLink>` component is whitespace sensitive; when reformatting make sure it stays within flowing text inline:
  ```md
  # Good

  Lorem ipsum dolor sit amet,
  consectetur <ExternalLink href="https://example.com">adipiscing elit</ExternalLink>.

  # Bad

  Lorem ipsum dolor sit amet, consectetur
  <ExternalLink href="https://example.com">adipiscing elit</ExternalLink>
  .
  ```
