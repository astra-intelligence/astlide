---
"@astlide/core": patch
"@astlide/astro": patch
---

**Add `ogImage` deck config for share cards.** A deck's `_config.json` can now set `ogImage` (root-relative path or absolute URL). Slide pages then emit `og:image` and a `summary_large_image` `twitter:card`, so a shared deck link shows a picture instead of a blank card. The Nuxt module mirrors the same meta for its slide pages.
