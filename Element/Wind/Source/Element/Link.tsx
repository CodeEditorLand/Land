import type { JSX } from "solid-js/jsx-runtime";

import { For, Show } from "solid-js";

export interface Property extends JSX.LinkHTMLAttributes<HTMLLinkElement> {
	Of?: string[];
}

export default ({ Of, rel, type, crossorigin }: Property) => (
	<For each={Of}>
		{(Link) => (
			<Show when={Link}>
				{Link && (
					<link
						type={type ?? "text/css"}
						rel={rel ?? "preconnect"}
						crossorigin={crossorigin ?? "anonymous"}
						href={Link}
					/>
				)}
			</Show>
		)}
	</For>
);
