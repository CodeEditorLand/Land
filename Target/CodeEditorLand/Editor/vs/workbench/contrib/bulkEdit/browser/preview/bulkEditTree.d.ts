import { IAsyncDataSource, ITreeRenderer, ITreeNode, ITreeSorter } from '../../../../../base/browser/ui/tree/tree.js';
import { ITextModelService } from '../../../../../editor/common/services/resolverService.js';
import { FuzzyScore } from '../../../../../base/common/filters.js';
import { ResourceLabels } from '../../../../browser/labels.js';
import { IIdentityProvider, IListVirtualDelegate, IKeyboardNavigationLabelProvider } from '../../../../../base/browser/ui/list/list.js';
import { BulkFileOperations, BulkFileOperation, BulkTextEdit, BulkCategory } from './bulkEditPreview.js';
import { ILabelService } from '../../../../../platform/label/common/label.js';
import type { IListAccessibilityProvider } from '../../../../../base/browser/ui/list/listWidget.js';
import { IconLabel } from '../../../../../base/browser/ui/iconLabel/iconLabel.js';
import { IThemeService } from '../../../../../platform/theme/common/themeService.js';
import { AriaRole } from '../../../../../base/browser/ui/aria/aria.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
export interface ICheckable {
    isChecked(): boolean;
    setChecked(value: boolean): void;
}
export declare class CategoryElement implements ICheckable {
    readonly parent: BulkFileOperations;
    readonly category: BulkCategory;
    constructor(parent: BulkFileOperations, category: BulkCategory);
    isChecked(): boolean;
    setChecked(value: boolean): void;
}
export declare class FileElement implements ICheckable {
    readonly parent: CategoryElement | BulkFileOperations;
    readonly edit: BulkFileOperation;
    constructor(parent: CategoryElement | BulkFileOperations, edit: BulkFileOperation);
    isChecked(): boolean;
    setChecked(value: boolean): void;
    isDisabled(): boolean;
}
export declare class TextEditElement implements ICheckable {
    readonly parent: FileElement;
    readonly idx: number;
    readonly edit: BulkTextEdit;
    readonly prefix: string;
    readonly selecting: string;
    readonly inserting: string;
    readonly suffix: string;
    constructor(parent: FileElement, idx: number, edit: BulkTextEdit, prefix: string, selecting: string, inserting: string, suffix: string);
    isChecked(): boolean;
    setChecked(value: boolean): void;
    isDisabled(): boolean;
}
export type BulkEditElement = CategoryElement | FileElement | TextEditElement;
export declare class BulkEditDataSource implements IAsyncDataSource<BulkFileOperations, BulkEditElement> {
    private readonly _textModelService;
    private readonly _instantiationService;
    groupByFile: boolean;
    constructor(_textModelService: ITextModelService, _instantiationService: IInstantiationService);
    hasChildren(element: BulkFileOperations | BulkEditElement): boolean;
    getChildren(element: BulkFileOperations | BulkEditElement): Promise<BulkEditElement[]>;
}
export declare class BulkEditSorter implements ITreeSorter<BulkEditElement> {
    compare(a: BulkEditElement, b: BulkEditElement): number;
}
export declare function compareBulkFileOperations(a: BulkFileOperation, b: BulkFileOperation): number;
export declare class BulkEditAccessibilityProvider implements IListAccessibilityProvider<BulkEditElement> {
    private readonly _labelService;
    constructor(_labelService: ILabelService);
    getWidgetAriaLabel(): string;
    getRole(_element: BulkEditElement): AriaRole;
    getAriaLabel(element: BulkEditElement): string | null;
}
export declare class BulkEditIdentityProvider implements IIdentityProvider<BulkEditElement> {
    getId(element: BulkEditElement): {
        toString(): string;
    };
}
declare class CategoryElementTemplate {
    readonly icon: HTMLDivElement;
    readonly label: IconLabel;
    constructor(container: HTMLElement);
}
export declare class CategoryElementRenderer implements ITreeRenderer<CategoryElement, FuzzyScore, CategoryElementTemplate> {
    private readonly _themeService;
    static readonly id: string;
    readonly templateId: string;
    constructor(_themeService: IThemeService);
    renderTemplate(container: HTMLElement): CategoryElementTemplate;
    renderElement(node: ITreeNode<CategoryElement, FuzzyScore>, _index: number, template: CategoryElementTemplate): void;
    disposeTemplate(template: CategoryElementTemplate): void;
}
declare class FileElementTemplate {
    private readonly _labelService;
    private readonly _disposables;
    private readonly _localDisposables;
    private readonly _checkbox;
    private readonly _label;
    private readonly _details;
    constructor(container: HTMLElement, resourceLabels: ResourceLabels, _labelService: ILabelService);
    dispose(): void;
    set(element: FileElement, score: FuzzyScore | undefined): void;
}
export declare class FileElementRenderer implements ITreeRenderer<FileElement, FuzzyScore, FileElementTemplate> {
    private readonly _resourceLabels;
    private readonly _labelService;
    static readonly id: string;
    readonly templateId: string;
    constructor(_resourceLabels: ResourceLabels, _labelService: ILabelService);
    renderTemplate(container: HTMLElement): FileElementTemplate;
    renderElement(node: ITreeNode<FileElement, FuzzyScore>, _index: number, template: FileElementTemplate): void;
    disposeTemplate(template: FileElementTemplate): void;
}
declare class TextEditElementTemplate {
    private readonly _themeService;
    private readonly _disposables;
    private readonly _localDisposables;
    private readonly _checkbox;
    private readonly _icon;
    private readonly _label;
    constructor(container: HTMLElement, _themeService: IThemeService);
    dispose(): void;
    set(element: TextEditElement): void;
}
export declare class TextEditElementRenderer implements ITreeRenderer<TextEditElement, FuzzyScore, TextEditElementTemplate> {
    private readonly _themeService;
    static readonly id = "TextEditElementRenderer";
    readonly templateId: string;
    constructor(_themeService: IThemeService);
    renderTemplate(container: HTMLElement): TextEditElementTemplate;
    renderElement({ element }: ITreeNode<TextEditElement, FuzzyScore>, _index: number, template: TextEditElementTemplate): void;
    disposeTemplate(_template: TextEditElementTemplate): void;
}
export declare class BulkEditDelegate implements IListVirtualDelegate<BulkEditElement> {
    getHeight(): number;
    getTemplateId(element: BulkEditElement): string;
}
export declare class BulkEditNaviLabelProvider implements IKeyboardNavigationLabelProvider<BulkEditElement> {
    getKeyboardNavigationLabel(element: BulkEditElement): string | undefined;
}
export {};
