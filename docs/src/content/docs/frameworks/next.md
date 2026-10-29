---
title: Next.js
description: Serve a folder of Astlide decks as pages of a Next.js app, with the presenter window, the print view and PDF / PPTX export.
---

`@astlide/next` turns a folder of decks into pages of a Next.js app (App Router). The decks are the same files as in an Astro site: `_config.json` and numbered `.mdx`, `.md`, `.html` and `.pptx` slides. MDX slides are compiled with the MDX engine Astro uses and rendered on the server with React, so a deck looks the same in both. Moving between slides uses Next's router.

You need Next.js 15 or later and React 19.

## Set up

Install the package. Add `mermaid` too if your slides have ```` ```mermaid ```` diagrams:

```bash
bun add @astlide/next
bun add mermaid   # optional
```

Wrap your Next config with `withAstlide`:

```js
// next.config.mjs
import { withAstlide } from "@astlide/next/config";

export default withAstlide({});
```

Astlide's packages ship TypeScript, so `withAstlide` adds them to `transpilePackages`. It also keeps the MDX engine's native module out of the server bundle (`serverExternalPackages`). Your own settings are kept.

Create the routes for a folder of decks, then add three pages that use them:

```ts
// lib/decks.ts
import { createDeckRoutes } from "@astlide/next";

export const decks = createDeckRoutes({ dir: "decks", basePath: "/decks" });
```

```tsx
// app/decks/page.tsx: the list of decks
import { decks } from "@/lib/decks";

export default decks.IndexPage;
```

```tsx
// app/decks/[deck]/[slide]/page.tsx: one slide
import { decks } from "@/lib/decks";

export const generateStaticParams = decks.slideParams;
export const generateMetadata = decks.slideMetadata;
export default decks.SlidePage;
```

```tsx
// app/decks/[deck]/all/page.tsx: the print view (PDF, PPTX, printing)
import { decks } from "@/lib/decks";

export const generateStaticParams = decks.deckParams;
export const generateMetadata = decks.printMetadata;
export default decks.PrintPage;
```

`basePath` must match the folder the pages are in, here `app/decks/`. To serve the decks at the root of the app, leave `basePath` out and put the pages in `app/`.

Finally, load the styles in the root layout:

```tsx
// app/layout.tsx
import "@astlide/next/styles";
import { AstlideMermaid } from "@astlide/next/mermaid";
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AstlideMermaid />
        {children}
      </body>
    </html>
  );
}
```

`@astlide/next/styles` brings the deck, slide and component styles, the seven built-in themes and KaTeX's styles. `<AstlideMermaid />` draws Mermaid diagrams. Leave it out if you didn't install `mermaid`, and diagrams show their source instead.

The built-in themes use the font families Inter and JetBrains Mono by name. Load them with a stylesheet that keeps those names, such as Google Fonts in the layout's `<head>`:

```tsx
<head>
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap"
  />
</head>
```

`next/font` renames font families, so the themes wouldn't find them.

Put a deck in `decks/my-talk/` and open `/decks/my-talk/1`.

## Options

`createDeckRoutes()` takes:

| Option | Default | Description |
|---|---|---|
| `dir` | `"decks"` | The folder with the deck folders, relative to the project root. |
| `basePath` | `""` | The URL path the deck pages are under. |
| `trailingSlash` | `false` | Set it to the same value as `trailingSlash` in your Next config. |
| `toolbar` | prev, counter, next | The toolbar buttons, as in the Astro integration's [`toolbar`](/reference/configuration/) option. |
| `shikiTheme` | `"github-dark"` | The Shiki theme for code blocks. |
| `showHidden` | in development | Show slides marked `hidden: true`. |

In production the decks are read once per server process. In development they are read again on every request, so edits show up on reload.

## Writing slides

Slides work as in an Astro site. The layouts, frontmatter, fragments, code highlighting, math, Mermaid and speaker notes are all the same. In MDX you can use Astlide's components without importing them: `Columns`, `Left`, `Right`, `ImageSide`, `TextPanel`, `Fragment`, `Fragments`, `SpeakerNotes` (or `Notes`), `CodeBlock`, `Math`, `YouTube` and `Tweet`. Hidden slides keep their number and are skipped in production, as in Astro.

The presenter window, overview, go-to dialog, pen, laser pointer and notes overlay work as well, with the same keys.

## Export

Run the app, then point `astlide export` at it. Include `basePath` in the URL:

```bash
bun run build && bun run start
bunx astlide export my-talk --pdf --pptx --png --base-url http://localhost:3000/decks
```

Outside an Astro project, every format comes from the running site. PDF and PNG are rendered from its pages. PPTX is made from the print view, with the same engine as in an Astro site. Use the production server (`next start`) for PPTX, because the development server loads its styles through JavaScript.

## Compared with the Astro integration

- Only the seven built-in themes are available. Plugins (custom themes, layouts, transitions, decorators) and [PowerPoint templates as themes](/guides/templates/) are Astro-only for now.
- The Astro integration's `font`, `favicon`, `csp` and `slideScripts` options have no counterpart. `<script>` tags in Markdown, HTML and PowerPoint slides are removed.
- The live slide editor (`e` in development) is Astro-only.
- Your app's root layout owns `<html>`, so a small script sets the deck's theme on it.
