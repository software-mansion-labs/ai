import type { Root, Heading } from "mdast";
import { toString } from "mdast-util-to-string";
import GithubSlugger from "github-slugger";
import path from "node:path";
import { type VFile } from "vfile";

const DOCS = path.resolve(process.cwd(), "src/content/docs");
const COMPONENTS = path.resolve(process.cwd(), "src/components");

export function remarkClapButtons(headingDepth = 2) {
  return (tree: Root, vfile: VFile) => {
    const filePath = vfile.history.at(0) ?? "";
    const fileDirectory = path.dirname(filePath);

    const relative = path.relative(DOCS, filePath);
    const articleSlug = relative.replace(/\.mdx?$/, "");

    const { clapButtons = true } = vfile.data.astro?.frontmatter ?? {};

    if (!clapButtons) {
      return;
    }

    const importPath = path
      .relative(fileDirectory, path.join(COMPONENTS, "ClapButton.astro"))
      .split(path.sep)
      .join("/");

    const slugger = new GithubSlugger();
    const headings: { index: number; slug: string }[] = [];

    for (const [index, node] of tree.children.entries()) {
      const isHeading = () => node.type === "heading";
      const isSpecifiedDepth = () => (node as Heading).depth === headingDepth;

      if (!isHeading() || !isSpecifiedDepth()) {
        continue;
      }

      const text = toString(node);
      const sectionSlug = slugger.slug(text);
      const slug = `${articleSlug}/${sectionSlug}`;

      headings.push({ index, slug });
    }

    if (headings.length === 0) {
      return;
    }

    for (let i = headings.length - 1; i >= 0; i--) {
      const heading = headings.at(i + 1);
      const at = heading ? heading.index : tree.children.length;

      tree.children.splice(
        at,
        0,
        makeClapButtonNode(headings[i].slug) as never,
      );
    }

    tree.children.unshift(makeImportNode(importPath) as never);
  };
}

function makeClapButtonNode(slug: string) {
  return {
    type: "mdxJsxFlowElement",
    name: "ClapButton",
    attributes: [{ type: "mdxJsxAttribute", name: "slug", value: slug }],
    children: [],
  };
}

function makeImportNode(importPath: string) {
  return {
    type: "mdxjsEsm",
    value: `import ClapButton from "${importPath}"`,
    data: {
      estree: {
        type: "Program",
        sourceType: "module",
        body: [
          {
            type: "ImportDeclaration",
            specifiers: [
              {
                type: "ImportDefaultSpecifier",
                local: { type: "Identifier", name: "ClapButton" },
              },
            ],
            source: {
              type: "Literal",
              value: importPath,
              raw: JSON.stringify(importPath),
            },
          },
        ],
      },
    },
  };
}
