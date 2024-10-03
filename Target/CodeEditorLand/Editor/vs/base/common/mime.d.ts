export declare const Mimes: Readonly<{
    text: "text/plain";
    binary: "application/octet-stream";
    unknown: "application/unknown";
    markdown: "text/markdown";
    latex: "text/latex";
    uriList: "text/uri-list";
}>;
export declare function getMediaOrTextMime(path: string): string | undefined;
export declare function getMediaMime(path: string): string | undefined;
export declare function getExtensionForMimeType(mimeType: string): string | undefined;
export declare function normalizeMimeType(mimeType: string): string;
export declare function normalizeMimeType(mimeType: string, strict: true): string | undefined;
