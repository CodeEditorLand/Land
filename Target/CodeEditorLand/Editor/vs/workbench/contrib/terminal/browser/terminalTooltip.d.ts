import { ITerminalInstance } from './terminal.js';
import { MarkdownString } from '../../../../base/common/htmlContent.js';
import type { IHoverAction } from '../../../../base/browser/ui/hover/hover.js';
export declare function getInstanceHoverInfo(instance: ITerminalInstance): {
    content: MarkdownString;
    actions: IHoverAction[];
};
export declare function getShellIntegrationTooltip(instance: ITerminalInstance, markdown: boolean): string;
export declare function getShellProcessTooltip(instance: ITerminalInstance, markdown: boolean): string;
