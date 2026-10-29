---
title: Nuxt
description: Serve a folder of Astlide decks as pages of a Nuxt app with one module, with the presenter window, the print view and PDF / PPTX export.
---

`@astlide/nuxt` is a Nuxt module that turns a folder of decks into pages of your app. The decks are the same files as in an Astro site: `_config.json` and numbered `.mdx`, `.md`, `.html` and `.pptx` slides.

The slides are read when the app is built. MDX slides are compiled into Vue components with the MDX engine Astro uses, and the components come from [`@astlide/vue`](/frameworks/vue/). The same component renders on the server, hydrates, and renders again when you move between slides. At run time there is no MDX compiler, and the server needs no native module. In development, editing a deck reloads the page.

You need Nuxt 4.

## Set up

Install the module. Add `mermaid` too if your slides have ```` ```mermaid ```` diagrams:

```bash
bun add @astlide/nuxt
bun add mermaid   # optional
```

Add it to your Nuxt config:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["@astlide/nuxt"],
  astlide: {
    dir: "decks",
    basePath: "/decks",
  },
  app: {
    head: {
      link: [
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap",
        },
      ],
    },
  },
});
```

The module adds three pages: the list of decks at `/decks/`, each slide at `/decks/<deck>/<n>`, and the print view at `/decks/<deck>/all`. Your app renders them with `<NuxtPage />`. If the app has no `pages/` folder of its own, also set `pages: true`. The module also loads Astlide's styles (the seven built-in themes and KaTeX included). The Google Fonts link above loads Inter and JetBrains Mono, the fonts the built-in themes use.

Put a deck in `decks/my-talk/` and open `/decks/my-talk/1`.

## Options

| Option | Default | Description |
|---|---|---|
| `dir` | `"decks"` | The folder with the deck folders, relative to the project root. |
| `basePath` | `""` | The URL path the deck pages are under. |
| `toolbar` | prev, counter, next | The toolbar buttons, as in the Astro integration's [`toolbar`](/reference/configuration/) option. |
| `shikiTheme` | `"github-dark"` | The Shiki theme for code blocks. |
| `showHidden` | in development | Show slides marked `hidden: true`. |
| `mermaid` | when `mermaid` is installed | Draw Mermaid diagrams. Without it, diagrams show their source, and `mermaid` isn't bundled. |

Root-relative URLs in slides, such as `<ImageSide src="/photo.jpg">`, follow your app's `app.baseURL`.

## Writing slides

Slides work as in an Astro site. The layouts, frontmatter, fragments, code highlighting, math, Mermaid and speaker notes are all the same. In MDX you can use Astlide's components without importing them: `Columns`, `Left`, `Right`, `ImageSide`, `TextPanel`, `Fragment`, `Fragments`, `SpeakerNotes` (or `Notes`), `CodeBlock`, `Math`, `YouTube` and `Tweet`. Hidden slides keep their number and are skipped in production, as in Astro.

The presenter window, overview, go-to dialog, pen, laser pointer and notes overlay work as well, with the same keys.

## Export

Build the app and run its server, then point `astlide export` at it. Include `basePath` in the URL:

```bash
bun run build && node .output/server/index.mjs
bunx astlide export my-talk --pdf --pptx --png --base-url http://localhost:3000/decks
```

Outside an Astro project, every format comes from the running site. PDF and PNG are rendered from its pages. PPTX is made from the print view, with the same engine as in an Astro site. Use the built server for PPTX, not `nuxt dev`.

## Compared with the Astro integration

- Only the seven built-in themes are available. Plugins (custom themes, layouts, transitions, decorators) and [PowerPoint templates as themes](/guides/templates/) are Astro-only for now.
- The Astro integration's `font`, `favicon`, `csp` and `slideScripts` options have no counterpart. `<script>` tags in Markdown, HTML and PowerPoint slides are removed.
- The live slide editor (`e` in development) is Astro-only.
