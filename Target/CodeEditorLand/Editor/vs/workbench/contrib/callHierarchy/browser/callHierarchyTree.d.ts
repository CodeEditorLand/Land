import { IAsyncDataSource, ITreeRenderer, ITreeNode, ITreeSorter } from '../../../../base/browser/ui/tree/tree.js';
import { CallHierarchyItem, CallHierarchyDirection, CallHierarchyModel } from '../common/callHierarchy.js';
import { IIdentityProvider, IListVirtualDelegate } from '../../../../base/browser/ui/list/list.js';
import { FuzzyScore } from '../../../../base/common/filters.js';
import { IconLabel } from '../../../../base/browser/ui/iconLabel/iconLabel.js';
import { Location } from '../../../../editor/common/languages.js';
import { IListAccessibilityProvider } from '../../../../base/browser/ui/list/listWidget.js';
export declare class Call {
    readonly item: CallHierarchyItem;
    readonly locations: Location[] | undefined;
    readonly model: CallHierarchyModel;
    readonly parent: Call | undefined;
    constructor(item: CallHierarchyItem, locations: Location[] | undefined, model: CallHierarchyModel, parent: Call | undefined);
    static compare(a: Call, b: Call): number;
}
export declare class DataSource implements IAsyncDataSource<CallHierarchyModel, Call> {
    getDirection: () => CallHierarchyDirection;
    constructor(getDirection: () => CallHierarchyDirection);
    hasChildren(): boolean;
    getChildren(element: CallHierarchyModel | Call): Promise<Call[]>;
}
export declare class Sorter implements ITreeSorter<Call> {
    compare(element: Call, otherElement: Call): number;
}
export declare class IdentityProvider implements IIdentityProvider<Call> {
    getDirection: () => CallHierarchyDirection;
    constructor(getDirection: () => CallHierarchyDirection);
    getId(element: Call): {
        toString(): string;
    };
}
declare class CallRenderingTemplate {
    readonly icon: HTMLDivElement;
    readonly label: IconLabel;
    constructor(icon: HTMLDivElement, label: IconLabel);
}
export declare class CallRenderer implements ITreeRenderer<Call, FuzzyScore, CallRenderingTemplate> {
    static readonly id = "CallRenderer";
    templateId: string;
    renderTemplate(container: HTMLElement): CallRenderingTemplate;
    renderElement(node: ITreeNode<Call, FuzzyScore>, _index: number, template: CallRenderingTemplate): void;
    disposeTemplate(template: CallRenderingTemplate): void;
}
export declare class VirtualDelegate implements IListVirtualDelegate<Call> {
    getHeight(_element: Call): number;
    getTemplateId(_element: Call): string;
}
export declare class AccessibilityProvider implements IListAccessibilityProvider<Call> {
    getDirection: () => CallHierarchyDirection;
    constructor(getDirection: () => CallHierarchyDirection);
    getWidgetAriaLabel(): string;
    getAriaLabel(element: Call): string | null;
}
export {};
