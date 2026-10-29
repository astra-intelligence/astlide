---
title: Astlide 3 への移行
description: Astlide 3 で Astro プロジェクトについて変わる点と、移行の手順です。デッキ自体は変わりません。
---

Astlide 3 では、同じデッキが Astro・Next.js・Nuxt・React・Vue のどれでも動きます。そのために、Astro のインテグレーションを `@astlide/core` から独立させ、`@astlide/astro` という別のパッケージにしました。`@astlide/core` は、どのフレームワークからも使う共通部分になっています。

**デッキには手を入れなくてかまいません。** スライド、frontmatter、`_config.json`、テーマ、レイアウト、コンポーネントは今までどおり動きます。Astro プロジェクトで必要な作業は、パッケージ名と一部の import の書き換えだけです。

## Astro プロジェクトの移行手順

1. パッケージを入れ替えます。`@astlide/astro` を入れると、`@astlide/core` と `astlide` コマンドも一緒に入ります。

   ```bash
   bun remove @astlide/core
   bun add @astlide/astro
   ```

2. インテグレーションを `@astlide/astro` から読み込みます。

   ```js
   // astro.config.mjs
   import astlide from "@astlide/astro"; // 以前は "@astlide/core"
   ```

3. ローダーとスキーマも `@astlide/astro` から読み込みます。

   ```ts
   // src/content.config.ts
   import { astlideDeckLoader, slideSchema } from "@astlide/astro"; // 以前は "@astlide/core"
   ```

4. Astlide のコンポーネントなどを直接 import している場合は、次の表のとおりにパスを書き換えます。

   | Astlide 2 | Astlide 3 |
   |---|---|
   | `@astlide/core`（インテグレーション、`astlideDeckLoader`） | `@astlide/astro` |
   | `@astlide/core/loader` | `@astlide/astro/loader` |
   | `@astlide/core/components/*.astro` | `@astlide/astro/components/*.astro` |
   | `@astlide/core/internal/diagrams` | `@astlide/core/runtime/diagrams` |
   | `@astlide/core/internal/recording` | `@astlide/core/runtime/media` |
   | `@astlide/core/internal/pdf-export` | `@astlide/core/runtime/pdf-export` |
   | 末尾が `.ts` のパス（`@astlide/core/utils/network.ts` など） | `.ts` を取ったパス |

   これ以外の `@astlide/core/internal/*` と、`utils/csp`・`utils/favicon`・`utils/pptx-templates`・`utils/slide-mark` は公開をやめました。もともとドキュメントに載せていない内部用のもので、今は `@astlide/astro` の一部です。

次のものは今までと同じ場所にあります：`@astlide/core/schema`・`/plugin`・`/context`・`/embed`・`/pptx`・`/templates`・`/mcp`・`/styles/*`、ドキュメントで案内している `utils/base-path`・`utils/code-highlight`・`utils/mermaid`。`@astlide/core` 自体からも、スキーマ、`defineAstlidePlugin`、`getDeckContext` / `getClientDeckContext` を引き続き import できます。

## プラグイン

プラグインは今までどおり `@astlide/core/plugin` から `defineAstlidePlugin` を import します。peer dependency は `@astlide/core` の 3 に上げてください。レイアウトを `.astro` のコンポーネントで提供しているなら、`@astlide/astro` の 3 にします。

## 3 で増えたもの

- **[Next.js](/ja/frameworks/next/)・[Nuxt](/ja/frameworks/nuxt/)・[React](/ja/frameworks/react/)・[Vue](/ja/frameworks/vue/) に対応しました。** MDX を含め、同じデッキをプレゼンターウィンドウや書き出しごと使えます。
- **Astro プロジェクトの外でも `astlide export --base-url` が使えます。** 起動中の Astlide サイトなら、どのフレームワークのものでも PDF・PNG・PPTX を書き出せます。
- **`@astlide/core/deck`・`/deck/pages`・`/deck/print-view`・`/render`・`/runtime` を公開しました。** 各フレームワーク用パッケージはこれらを組み合わせて作っています。まだパッケージのないフレームワークにデッキを載せるときにも使えます。
