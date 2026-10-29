---
title: Next.js
description: Astlide のデッキのフォルダを Next.js アプリのページとして配信する方法です。プレゼンターウィンドウ、印刷ビュー、PDF・PPTX の書き出しもそのまま使えます。
---

`@astlide/next` を入れると、デッキのフォルダが Next.js アプリ（App Router）のページになります。デッキは Astro サイトと同じファイルで、`_config.json` と番号付きの `.mdx`・`.md`・`.html`・`.pptx` を置きます。MDX は Astro と同じ MDX エンジンでコンパイルし、サーバー側で React によって描画するので、同じデッキは Astro でも Next.js でも同じ見た目になります。スライド間の移動には Next.js のルーターを使います。

Next.js 15 以降と React 19 が必要です。

## セットアップ

パッケージを入れます。スライドに ```` ```mermaid ```` の図があるなら `mermaid` も入れてください。

```bash
bun add @astlide/next
bun add mermaid   # 図を使うときだけ
```

Next.js の設定を `withAstlide` で包みます。

```js
// next.config.mjs
import { withAstlide } from "@astlide/next/config";

export default withAstlide({});
```

Astlide のパッケージは TypeScript のまま配布しているので、`withAstlide` はそれらを `transpilePackages` に加えます。あわせて、MDX エンジンのネイティブモジュールをサーバー用バンドルから外します（`serverExternalPackages`）。もとの設定はそのまま残ります。

デッキのフォルダからルートを作り、それを使うページを 3 つ置きます。

```ts
// lib/decks.ts
import { createDeckRoutes } from "@astlide/next";

export const decks = createDeckRoutes({ dir: "decks", basePath: "/decks" });
```

```tsx
// app/decks/page.tsx — デッキの一覧
import { decks } from "@/lib/decks";

export default decks.IndexPage;
```

```tsx
// app/decks/[deck]/[slide]/page.tsx — スライド 1 枚
import { decks } from "@/lib/decks";

export const generateStaticParams = decks.slideParams;
export const generateMetadata = decks.slideMetadata;
export default decks.SlidePage;
```

```tsx
// app/decks/[deck]/all/page.tsx — 印刷ビュー（PDF・PPTX・印刷用）
import { decks } from "@/lib/decks";

export const generateStaticParams = decks.deckParams;
export const generateMetadata = decks.printMetadata;
export default decks.PrintPage;
```

`basePath` は、ページを置いたフォルダ（ここでは `app/decks/`）に合わせます。アプリのルートに置くなら、`basePath` を省いてページを `app/` 直下に置いてください。

最後に、ルートレイアウトでスタイルを読み込みます。

```tsx
// app/layout.tsx
import "@astlide/next/styles";
import { AstlideMermaid } from "@astlide/next/mermaid";
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap"
        />
      </head>
      <body>
        <AstlideMermaid />
        {children}
      </body>
    </html>
  );
}
```

`@astlide/next/styles` で、デッキ・スライド・コンポーネントのスタイル、組み込みの 7 テーマ、KaTeX のスタイルがまとめて入ります。`<AstlideMermaid />` は Mermaid の図を描くためのものなので、`mermaid` を入れていないなら外してください。その場合、図はソースのまま表示されます。

組み込みテーマは Inter と JetBrains Mono をフォント名で指定しています。上の例のように、フォント名が変わらない Google Fonts の `<link>` で読み込んでください。`next/font` はフォント名を独自のものに書き換えるため、テーマから見つけられません。

`decks/my-talk/` にデッキを置き、`/decks/my-talk/1` を開けば表示されます。

## オプション

`createDeckRoutes()` に渡せるオプションです。

| オプション | 既定値 | 内容 |
|---|---|---|
| `dir` | `"decks"` | デッキのフォルダを並べた場所。プロジェクトのルートからのパスです。 |
| `basePath` | `""` | デッキのページを置く URL のパス。 |
| `trailingSlash` | `false` | Next.js の設定の `trailingSlash` と同じ値にします。 |
| `toolbar` | 前へ・番号・次へ | ツールバーのボタン。Astro の [`toolbar`](/ja/reference/configuration/) オプションと同じ書き方です。 |
| `shikiTheme` | `"github-dark"` | コードブロックの Shiki テーマ。 |
| `showHidden` | 開発時のみ | `hidden: true` のスライドも表示します。 |

本番ではデッキをサーバーのプロセスごとに一度だけ読みます。開発中はリクエストのたびに読み直すので、編集はリロードで反映されます。

## スライドの書き方

Astro サイトと同じです。レイアウト、frontmatter、フラグメント、コードのハイライト、数式、Mermaid、スピーカーノートはどれも変わりません。MDX では、Astlide のコンポーネントを import せずに使えます。使えるのは `Columns`・`Left`・`Right`・`ImageSide`・`TextPanel`・`Fragment`・`Fragments`・`SpeakerNotes`（`Notes`）・`CodeBlock`・`Math`・`YouTube`・`Tweet` です。非表示のスライドも Astro と同じ扱いで、番号はそのまま残り、本番では飛ばされます。

プレゼンターウィンドウ、一覧表示、スライド番号へのジャンプ、ペン、レーザーポインター、ノート表示も、同じキーで使えます。

## 書き出し

アプリを起動してから、`astlide export` でそのサイトを指定します。URL には `basePath` まで含めてください。

```bash
bun run build && bun run start
bunx astlide export my-talk --pdf --pptx --png --base-url http://localhost:3000/decks
```

Astro プロジェクトの外で実行すると、どの形式も起動中のサイトから作ります。PDF と PNG はページを描画したもので、PPTX は印刷ビューから Astro と同じエンジンで作ります。開発サーバーは JavaScript 経由でスタイルを読み込むため、PPTX は本番サーバー（`next start`）から書き出してください。

## Astro 版との違い

- テーマは組み込みの 7 つだけです。プラグイン（独自のテーマ・レイアウト・トランジション・デコレーター）と、[PowerPoint テンプレートのテーマ化](/ja/guides/templates/)は、今のところ Astro だけの機能です。
- Astro 版の `font`・`favicon`・`csp`・`slideScripts` にあたるオプションはありません。Markdown・HTML・PowerPoint のスライドに含まれる `<script>` は取り除かれます。
- 開発中のスライド編集（`e` キー）は Astro だけです。
- `<html>` はアプリのルートレイアウトが持つため、デッキのテーマは小さなスクリプトで `<html>` に設定しています。
