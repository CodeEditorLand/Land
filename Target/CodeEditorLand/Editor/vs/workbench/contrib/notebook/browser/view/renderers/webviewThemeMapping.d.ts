import { WebviewStyles } from '../../../../webview/browser/webview.js';
/**
 * Transforms base vscode theme variables into generic variables for notebook
 * renderers.
 * @see https://github.com/microsoft/vscode/issues/107985 for context
 * @deprecated
 */
export declare const transformWebviewThemeVars: (s: Readonly<WebviewStyles>) => WebviewStyles;
