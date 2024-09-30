/**
 * @module Worker
 *
 */
export default interface Interface extends ExportedHandler<Environment> {
	fetch: (
		Request: Request,
		Environment: Environment,
		Context: ExecutionContext,
	) => Response;
}

import type {
	ExecutionContext,
	ExportedHandler,
	Request,
	Response,
} from "@cloudflare/workers-types/experimental/index.js";

import type Environment from "../Interface/Environment.js";
