import type * as webviewMessages from './webviewMessages.js';
interface PreloadStyles {
    readonly outputNodePadding: number;
    readonly outputNodeLeftPadding: number;
    readonly tokenizationCss: string;
}
export interface PreloadOptions {
    dragAndDropEnabled: boolean;
}
export interface RenderOptions {
    readonly lineLimit: number;
    readonly outputScrolling: boolean;
    readonly outputWordWrap: boolean;
    readonly linkifyFilePaths: boolean;
    readonly minimalError: boolean;
}
export declare function preloadsScriptStr(styleValues: PreloadStyles, options: PreloadOptions, renderOptions: RenderOptions, renderers: readonly webviewMessages.RendererMetadata[], preloads: readonly webviewMessages.StaticPreloadMetadata[], isWorkspaceTrusted: boolean, nonce: string): string;
export {};
