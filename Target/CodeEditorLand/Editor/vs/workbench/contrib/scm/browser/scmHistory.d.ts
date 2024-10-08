import { ColorIdentifier } from '../../../../platform/theme/common/colorUtils.js';
import { ISCMHistoryItem, ISCMHistoryItemGraphNode, ISCMHistoryItemRef, ISCMHistoryItemViewModel } from '../common/history.js';
export declare const SWIMLANE_HEIGHT = 22;
export declare const SWIMLANE_WIDTH = 11;
/**
 * History item reference colors (local, remote, base)
 */
export declare const historyItemRefColor: string;
export declare const historyItemRemoteRefColor: string;
export declare const historyItemBaseRefColor: string;
/**
 * History item hover color
 */
export declare const historyItemHoverDefaultLabelForeground: string;
export declare const historyItemHoverDefaultLabelBackground: string;
export declare const historyItemHoverLabelForeground: string;
export declare const historyItemHoverAdditionsForeground: string;
export declare const historyItemHoverDeletionsForeground: string;
/**
 * History graph color registry
 */
export declare const colorRegistry: ColorIdentifier[];
export declare function renderSCMHistoryItemGraph(historyItemViewModel: ISCMHistoryItemViewModel): SVGElement;
export declare function renderSCMHistoryGraphPlaceholder(columns: ISCMHistoryItemGraphNode[]): HTMLElement;
export declare function toISCMHistoryItemViewModelArray(historyItems: ISCMHistoryItem[], colorMap?: Map<string, string | undefined>, currentHistoryItemRef?: ISCMHistoryItemRef, currentHistoryItemRemoteRef?: ISCMHistoryItemRef, currentHistoryItemBaseRef?: ISCMHistoryItemRef): ISCMHistoryItemViewModel[];
