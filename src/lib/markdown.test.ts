import { describe, expect, test } from "bun:test";

import { renderMarkdown } from "./markdown";

describe("renderMarkdown", () => {
  test("renders basic markdown", async () => {
    const html = await renderMarkdown("# Hello\n\nThis is **bold**.");

    expect(html).toContain("<h1");
    expect(html).toContain("Hello");
    expect(html).toContain("<strong>bold</strong>");
  });

  test("sanitizes raw HTML", async () => {
    const html = await renderMarkdown('<script>alert("xss")</script>\n\n<div>safe?</div>');

    expect(html).not.toContain("<script");
    expect(html).not.toContain("alert(");
    expect(html).toContain("<div>safe?</div>");
  });

  test("sanitizes dangerous HTML attributes", async () => {
    const html = await renderMarkdown('<img src="x" onerror="alert(1)" />');

    expect(html).not.toContain("onerror");
    expect(html).not.toContain("alert(1)");
  });

  test("renders fenced code blocks", async () => {
    const html = await renderMarkdown('```typescript\nconst value: string = "hello";\n```');

    expect(html).toContain("language-typescript");
    expect(html).toContain("const");
    expect(html).toContain("value");
  });

  test("preserves Mermaid blocks as escaped code", async () => {
    const html = await renderMarkdown("```mermaid\ngraph TD\n  A --> B\n```");

    expect(html).toContain("language-mermaid");
    expect(html).toContain("graph TD");
    expect(html).toContain("A");
    expect(html).toContain("B");

    expect(html).not.toContain("<svg");
  });

  test("escapes HTML inside Mermaid source", async () => {
    const html = await renderMarkdown(
      "```mermaid\ngraph TD\n  A --> B<script>alert(1)</script>\n```",
    );

    expect(html).not.toContain("<script>");
    expect(html).not.toContain("</script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("&lt;/script&gt;");
  });

  test("renders links", async () => {
    const html = await renderMarkdown("[Example](https://example.com)");

    expect(html).toContain('href="https://example.com"');
    expect(html).toContain("Example");
  });

  test("renders lists", async () => {
    const html = await renderMarkdown("- First\n- Second\n- Third");

    expect(html).toContain("<ul>");
    expect(html).toContain("<li>First</li>");
    expect(html).toContain("<li>Second</li>");
    expect(html).toContain("<li>Third</li>");
  });

  test("renders blockquotes", async () => {
    const html = await renderMarkdown("> This is a quote.");

    expect(html).toContain("<blockquote>");
    expect(html).toContain("This is a quote.");
  });

  test("renders tables", async () => {
    const html = await renderMarkdown("| Name | Value |\n| --- | --- |\n| Foo | Bar |");

    expect(html).toContain("<table>");
    expect(html).toContain("<th>Name</th>");
    expect(html).toContain("<td>Foo</td>");
    expect(html).toContain("<td>Bar</td>");
  });
});
