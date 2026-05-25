import { layout, prepare } from "@chenglou/pretext";
import { useLayoutEffect, useRef, useState } from "react";

export function useStableHeaderHeight(text: string) {
	const elementRef = useRef<HTMLHeadingElement>(null);
	const [minHeight, setMinHeight] = useState<number | null>(null);

	useLayoutEffect(() => {
		const el = elementRef.current;
		if (!el || !text) return;

		const measure = () => {
			try {
				// 1. Get current container dimensions and computed styles
				const rect = el.getBoundingClientRect();
				const style = window.getComputedStyle(el);

				const width = rect.width;
				if (width <= 0) return;

				const fontSize = style.fontSize; // e.g. "96px"
				const fontFamily = style.fontFamily; // e.g. '"Instrument Serif", serif'

				// Handle line-height calculation (default to 0.85 as specified in BlogPostLayout.tsx tailwind styles)
				let lineHeightPx = parseFloat(style.lineHeight);
				if (Number.isNaN(lineHeightPx)) {
					lineHeightPx = parseFloat(fontSize) * 0.85;
				}

				// 2. Prepare the font string for the heaviest weight (900) at italic style
				// Since variable fonts change character widths, we must size for the peak weight
				const maxFontStr = `italic 900 ${fontSize} ${fontFamily}`;

				// 3. Perform high-performance DOM-free text wrapping calculation
				const prepared = prepare(text, maxFontStr);
				const { height } = layout(prepared, width, lineHeightPx);

				setMinHeight(height);
			} catch (err) {
				console.error("[useStableHeaderHeight] Pre-measurement failed:", err);
			}
		};

		// Run layout calculation immediately on mount
		measure();

		// Re-calculate height on viewport resize
		const observer = new ResizeObserver(() => measure());
		observer.observe(el);

		return () => observer.disconnect();
	}, [text]);

	return { elementRef, minHeight };
}
