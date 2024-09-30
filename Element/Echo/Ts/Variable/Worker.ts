/**
 * @module Worker
 *
 */
export default {
	fetch: (...[{ headers }, Environment]: Parameters<Interface["fetch"]>) => {
		const Upgrade = headers.get("Upgrade");

		if (!Upgrade || Upgrade !== "websocket") {
			return new Response("Expected Upgrade: WebSocket", { status: 426 });
		}

		const WebSocket = new WebSocketPair();

		if (WebSocket[1]) {
			WebSocket[1].accept();

			WebSocket[1].addEventListener("message", async ({ data }) => {
				const Data: Data = new Map([]);

				try {
					const Message = await (
						await import(
							"@codeeditorland/common/Target/Function/Get.js"
						)
					).default(JSON.parse(data.toString()));

					Message.get("View") === "Content"
						? Data.set(
								Message.get("From"),
								(await Access(
									Message.get("Key"),
									Message.get("Identifier"),
									Environment[
										Message.get("From") as
											| "HTML"
											| "CSS"
											| "TypeScript"
									],
									"Current",
								)) as Message,
							)
						: {};

					// TODO: When leaving persist content in a time-series database (preferably git)
					WebSocket[1].send(
						JSON.stringify({
							Original: Put(Message),
							Data: Put(Data),
						}),
					);
				} catch (_Error) {
					console.log(_Error);
				}
			});
		}

		if (WebSocket[0]) {
			return new Response(null, {
				status: 101,
				webSocket: WebSocket[0],
			});
		}

		return new Response("Can't make a WebSocket.", { status: 404 });
	},
} satisfies Interface;

export const { default: Access } = await import(
	"@codeeditorland/common/Target/Function/Access.js"
);

export const { default: Put } = await import(
	"@codeeditorland/common/Target/Function/Put.js"
);

export const { WebSocketPair } = await import(
	"@cloudflare/workers-types/experimental/index.js"
);

import type Data from "../Interface/Data.js";
import type Message from "../Interface/Message.js";
import type Interface from "../Interface/Worker.js";
