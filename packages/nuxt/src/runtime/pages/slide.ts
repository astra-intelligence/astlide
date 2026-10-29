/** A slide page: `<DeckPage>` driven by Nuxt's router, the presenter window from the URL. */

import { slidePage } from "@astlide/core/deck/pages";
import { themeName } from "@astlide/core/deck/print-view";
import { DeckPage, Slide } from "@astlide/vue";
import { defineComponent, h, onMounted, ref } from "vue";
import { createError, navigateTo, useHead, useRequestURL, useRoute } from "#app";
import { findDeck, mermaidLoader, options, useMdxComponents } from "../shared";

export default defineComponent({
	name: "AstlideSlidePage",
	async setup() {
		// Nuxt's composables before the first `await` (they need the component).
		const route = useRoute();
		const deck = findDeck(route.params.deck);
		const page = slidePage(deck, Number(route.params.slide), { showHidden: options.showHidden });
		if (!page)
			throw createError({ statusCode: 404, statusMessage: "Slide not found", fatal: true });
		if (page.redirectTo !== undefined) {
			await navigateTo(`${options.basePath}/${encodeURIComponent(deck.name)}/${page.redirectTo}`, {
				redirectCode: 302,
				replace: true,
			});
			return () => null;
		}
		const { slide, number, totalSlides } = page;
		const title = `${deck.config.title ?? deck.name} - Slide ${number}`;
		// `_config.json` `ogImage` → absolute URL for crawlers. Root-relative paths
		// resolve against the request origin + configured basePath; absolute URLs
		// (http/https) pass through unchanged.
		let ogImageUrl = deck.config.ogImage as string | undefined;
		if (ogImageUrl && !/^https?:\/\//i.test(ogImageUrl)) {
			const requestUrl = useRequestURL();
			ogImageUrl = `${requestUrl.origin}${options.basePath ?? ""}${ogImageUrl.startsWith("/") ? ogImageUrl : `/${ogImageUrl}`}`;
		}
		useHead({
			title,
			htmlAttrs: { "data-theme": themeName(deck.config.theme) },
			meta: [
				{ name: "description", content: slide.description ?? title },
				{ name: "robots", content: "noindex, nofollow" },
				...(ogImageUrl
					? [
							{ property: "og:title", content: title },
							{ property: "og:description", content: `Slide deck: ${title}` },
							{ property: "og:type", content: "website" },
							{ property: "og:image", content: ogImageUrl },
							{ name: "twitter:card", content: "summary_large_image" },
							{ name: "twitter:title", content: title },
							{ name: "twitter:description", content: `Slide deck: ${title}` },
							{ name: "twitter:image", content: ogImageUrl },
						]
					: []),
			],
		});
		const components = useMdxComponents();
		// The presenter window is `?presenter` (or the popup): known on the client only.
		const presenter = ref(false);
		const loadMermaid = ref<ReturnType<typeof mermaidLoader>>(null);
		onMounted(() => {
			presenter.value = "presenter" in route.query || window.name === "astlide-presenter";
			loadMermaid.value = mermaidLoader();
		});
		const navigate = (url: string, { replace }: { replace: boolean }) => {
			void navigateTo(url, { replace });
		};

		const content = await slide.load();
		const Content = content.default;
		return () =>
			h(
				DeckPage,
				{
					deck: deck.name,
					slideNumber: number,
					totalSlides,
					prevSlide: page.prevSlide,
					nextSlide: page.nextSlide,
					firstSlide: page.firstSlide,
					lastSlide: page.lastSlide,
					basePath: options.basePath,
					toolbar: options.toolbar,
					outline: page.outline,
					notesHtml: content.notesHtml,
					deckContext: page.deckContext,
					presenter: presenter.value,
					navigate,
					...(loadMermaid.value ? { loadMermaid: loadMermaid.value } : {}),
				},
				() =>
					h(
						Slide,
						{
							layout: slide.data.slideLayout,
							transition: slide.data.transition,
							background: slide.data.background,
							className: slide.data.class,
							slideNumber: number,
							totalSlides,
							...(Content ? {} : { html: content.html ?? "" }),
						},
						Content ? () => h(Content, { components }) : undefined,
					),
			);
	},
});
