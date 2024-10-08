var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
const sw = (
  /** @type {ServiceWorkerGlobalScope} */
  /** @type {any} */
  self
);
const VERSION = 4;
const resourceCacheName = `vscode-resource-cache-${VERSION}`;
const rootPath = sw.location.pathname.replace(/\/service-worker.js$/, "");
const searchParams = new URL(location.toString()).searchParams;
const remoteAuthority = searchParams.get("remoteAuthority");
const resourceBaseAuthority = searchParams.get("vscode-resource-base-authority");
const resolveTimeout = 3e4;
class RequestStore {
  static {
    __name(this, "RequestStore");
  }
  constructor() {
    this.map = /* @__PURE__ */ new Map();
    this.requestPool = 0;
  }
  /**
   * @returns {{ requestId: number, promise: Promise<RequestStoreResult<T>> }}
   */
  create() {
    const requestId = ++this.requestPool;
    let resolve;
    const promise = new Promise((r) => resolve = r);
    const entry = { resolve: (
      /** @type {(x: RequestStoreResult<T>) => void} */
      resolve
    ), promise };
    this.map.set(requestId, entry);
    const dispose = /* @__PURE__ */ __name(() => {
      clearTimeout(timeout);
      const existingEntry = this.map.get(requestId);
      if (existingEntry === entry) {
        existingEntry.resolve({ status: "timeout" });
        this.map.delete(requestId);
        return;
      }
    }, "dispose");
    const timeout = setTimeout(dispose, resolveTimeout);
    return { requestId, promise };
  }
  /**
   * @param {number} requestId
   * @param {T} result
   * @return {boolean}
   */
  resolve(requestId, result) {
    const entry = this.map.get(requestId);
    if (!entry) {
      return false;
    }
    entry.resolve({ status: "ok", value: result });
    this.map.delete(requestId);
    return true;
  }
}
const resourceRequestStore = new RequestStore();
const localhostRequestStore = new RequestStore();
const unauthorized = /* @__PURE__ */ __name(() => new Response("Unauthorized", { status: 401 }), "unauthorized");
const notFound = /* @__PURE__ */ __name(() => new Response("Not Found", { status: 404 }), "notFound");
const methodNotAllowed = /* @__PURE__ */ __name(() => new Response("Method Not Allowed", { status: 405 }), "methodNotAllowed");
const requestTimeout = /* @__PURE__ */ __name(() => new Response("Request Timeout", { status: 408 }), "requestTimeout");
sw.addEventListener("message", async (event) => {
  switch (event.data.channel) {
    case "version": {
      const source = (
        /** @type {Client} */
        event.source
      );
      sw.clients.get(source.id).then((client) => {
        if (client) {
          client.postMessage({
            channel: "version",
            version: VERSION
          });
        }
      });
      return;
    }
    case "did-load-resource": {
      const response = event.data.data;
      if (!resourceRequestStore.resolve(response.id, response)) {
        console.log("Could not resolve unknown resource", response.path);
      }
      return;
    }
    case "did-load-localhost": {
      const data = event.data.data;
      if (!localhostRequestStore.resolve(data.id, data.location)) {
        console.log("Could not resolve unknown localhost", data.origin);
      }
      return;
    }
    default: {
      console.log("Unknown message");
      return;
    }
  }
});
sw.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);
  if (typeof resourceBaseAuthority === "string" && requestUrl.protocol === "https:" && requestUrl.hostname.endsWith("." + resourceBaseAuthority)) {
    switch (event.request.method) {
      case "GET":
      case "HEAD": {
        const firstHostSegment = requestUrl.hostname.slice(0, requestUrl.hostname.length - (resourceBaseAuthority.length + 1));
        const scheme = firstHostSegment.split("+", 1)[0];
        const authority = firstHostSegment.slice(scheme.length + 1);
        return event.respondWith(processResourceRequest(event, {
          scheme,
          authority,
          path: requestUrl.pathname,
          query: requestUrl.search.replace(/^\?/, "")
        }));
      }
      default: {
        return event.respondWith(methodNotAllowed());
      }
    }
  }
  if (requestUrl.origin !== sw.origin && requestUrl.host === remoteAuthority) {
    switch (event.request.method) {
      case "GET":
      case "HEAD": {
        return event.respondWith(processResourceRequest(event, {
          path: requestUrl.pathname,
          scheme: requestUrl.protocol.slice(0, requestUrl.protocol.length - 1),
          authority: requestUrl.host,
          query: requestUrl.search.replace(/^\?/, "")
        }));
      }
      default: {
        return event.respondWith(methodNotAllowed());
      }
    }
  }
  if (requestUrl.origin !== sw.origin && requestUrl.host.match(/^(localhost|127.0.0.1|0.0.0.0):(\d+)$/)) {
    return event.respondWith(processLocalhostRequest(event, requestUrl));
  }
});
sw.addEventListener("install", (event) => {
  event.waitUntil(sw.skipWaiting());
});
sw.addEventListener("activate", (event) => {
  event.waitUntil(sw.clients.claim());
});
async function processResourceRequest(event, requestUrlComponents) {
  const client = await sw.clients.get(event.clientId);
  if (!client) {
    console.error("Could not find inner client for request");
    return notFound();
  }
  const webviewId = getWebviewIdForClient(client);
  if (!webviewId) {
    console.error("Could not resolve webview id");
    return notFound();
  }
  const shouldTryCaching = event.request.method === "GET";
  const resolveResourceEntry = /* @__PURE__ */ __name((result, cachedResponse) => {
    if (result.status === "timeout") {
      return requestTimeout();
    }
    const entry = result.value;
    if (entry.status === 304) {
      if (cachedResponse) {
        return cachedResponse.clone();
      } else {
        throw new Error("No cache found");
      }
    }
    if (entry.status === 401) {
      return unauthorized();
    }
    if (entry.status !== 200) {
      return notFound();
    }
    const commonHeaders = {
      "Access-Control-Allow-Origin": "*"
    };
    const byteLength = entry.data.byteLength;
    const range = event.request.headers.get("range");
    if (range) {
      const bytes = range.match(/^bytes\=(\d+)\-(\d+)?$/g);
      if (bytes) {
        const start = Number(bytes[1]);
        const end = Number(bytes[2]) || byteLength - 1;
        return new Response(entry.data.slice(start, end + 1), {
          status: 206,
          headers: {
            ...commonHeaders,
            "Content-range": `bytes 0-${end}/${byteLength}`
          }
        });
      } else {
        return new Response(null, {
          status: 416,
          headers: {
            ...commonHeaders,
            "Content-range": `*/${byteLength}`
          }
        });
      }
    }
    const headers = {
      ...commonHeaders,
      "Content-Type": entry.mime,
      "Content-Length": byteLength.toString()
    };
    if (entry.etag) {
      headers["ETag"] = entry.etag;
      headers["Cache-Control"] = "no-cache";
    }
    if (entry.mtime) {
      headers["Last-Modified"] = new Date(entry.mtime).toUTCString();
    }
    const coiRequest = new URL(event.request.url).searchParams.get("vscode-coi");
    if (coiRequest === "3") {
      headers["Cross-Origin-Opener-Policy"] = "same-origin";
      headers["Cross-Origin-Embedder-Policy"] = "require-corp";
    } else if (coiRequest === "2") {
      headers["Cross-Origin-Embedder-Policy"] = "require-corp";
    } else if (coiRequest === "1") {
      headers["Cross-Origin-Opener-Policy"] = "same-origin";
    }
    const response = new Response(entry.data, {
      status: 200,
      headers
    });
    if (shouldTryCaching && entry.etag) {
      caches.open(resourceCacheName).then((cache) => {
        return cache.put(event.request, response);
      });
    }
    return response.clone();
  }, "resolveResourceEntry");
  const parentClients = await getOuterIframeClient(webviewId);
  if (!parentClients.length) {
    console.log("Could not find parent client for request");
    return notFound();
  }
  let cached;
  if (shouldTryCaching) {
    const cache = await caches.open(resourceCacheName);
    cached = await cache.match(event.request);
  }
  const { requestId, promise } = resourceRequestStore.create();
  for (const parentClient of parentClients) {
    parentClient.postMessage({
      channel: "load-resource",
      id: requestId,
      scheme: requestUrlComponents.scheme,
      authority: requestUrlComponents.authority,
      path: requestUrlComponents.path,
      query: requestUrlComponents.query,
      ifNoneMatch: cached?.headers.get("ETag")
    });
  }
  return promise.then((entry) => resolveResourceEntry(entry, cached));
}
__name(processResourceRequest, "processResourceRequest");
async function processLocalhostRequest(event, requestUrl) {
  const client = await sw.clients.get(event.clientId);
  if (!client) {
    return fetch(event.request);
  }
  const webviewId = getWebviewIdForClient(client);
  if (!webviewId) {
    console.error("Could not resolve webview id");
    return fetch(event.request);
  }
  const origin = requestUrl.origin;
  const resolveRedirect = /* @__PURE__ */ __name(async (result) => {
    if (result.status !== "ok" || !result.value) {
      return fetch(event.request);
    }
    const redirectOrigin = result.value;
    const location2 = event.request.url.replace(new RegExp(`^${requestUrl.origin}(/|$)`), `${redirectOrigin}$1`);
    return new Response(null, {
      status: 302,
      headers: {
        Location: location2
      }
    });
  }, "resolveRedirect");
  const parentClients = await getOuterIframeClient(webviewId);
  if (!parentClients.length) {
    console.log("Could not find parent client for request");
    return notFound();
  }
  const { requestId, promise } = localhostRequestStore.create();
  for (const parentClient of parentClients) {
    parentClient.postMessage({
      channel: "load-localhost",
      origin,
      id: requestId
    });
  }
  return promise.then(resolveRedirect);
}
__name(processLocalhostRequest, "processLocalhostRequest");
function getWebviewIdForClient(client) {
  const requesterClientUrl = new URL(client.url);
  return requesterClientUrl.searchParams.get("id");
}
__name(getWebviewIdForClient, "getWebviewIdForClient");
async function getOuterIframeClient(webviewId) {
  const allClients = await sw.clients.matchAll({ includeUncontrolled: true });
  return allClients.filter((client) => {
    const clientUrl = new URL(client.url);
    const hasExpectedPathName = clientUrl.pathname === `${rootPath}/` || clientUrl.pathname === `${rootPath}/index.html` || clientUrl.pathname === `${rootPath}/index-no-csp.html`;
    return hasExpectedPathName && clientUrl.searchParams.get("id") === webviewId;
  });
}
__name(getOuterIframeClient, "getOuterIframeClient");
//# sourceMappingURL=service-worker.js.map
