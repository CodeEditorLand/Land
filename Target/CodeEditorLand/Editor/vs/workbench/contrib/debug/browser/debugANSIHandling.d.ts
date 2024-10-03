import { RGBA } from '../../../../base/common/color.js';
import { IWorkspaceFolder } from '../../../../platform/workspace/common/workspace.js';
import { ILinkDetector } from './linkDetector.js';
export declare function handleANSIOutput(text: string, linkDetector: ILinkDetector, workspaceFolder: IWorkspaceFolder | undefined): HTMLSpanElement;
export declare function appendStylizedStringToContainer(root: HTMLElement, stringContent: string, cssClasses: string[], linkDetector: ILinkDetector, workspaceFolder: IWorkspaceFolder | undefined, customTextColor?: RGBA | string, customBackgroundColor?: RGBA | string, customUnderlineColor?: RGBA | string): void;
export declare function calcANSI8bitColor(colorNumber: number): RGBA | undefined;
