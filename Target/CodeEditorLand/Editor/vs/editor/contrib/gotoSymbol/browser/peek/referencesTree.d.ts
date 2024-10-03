import { IKeyboardEvent } from '../../../../../base/browser/keyboardEvent.js';
import { CountBadge } from '../../../../../base/browser/ui/countBadge/countBadge.js';
import { HighlightedLabel } from '../../../../../base/browser/ui/highlightedlabel/highlightedLabel.js';
import { IconLabel } from '../../../../../base/browser/ui/iconLabel/iconLabel.js';
import { IIdentityProvider, IKeyboardNavigationLabelProvider, IListVirtualDelegate } from '../../../../../base/browser/ui/list/list.js';
import { IListAccessibilityProvider } from '../../../../../base/browser/ui/list/listWidget.js';
import { IAsyncDataSource, ITreeNode, ITreeRenderer } from '../../../../../base/browser/ui/tree/tree.js';
import { FuzzyScore, IMatch } from '../../../../../base/common/filters.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { ITextModelService } from '../../../../common/services/resolverService.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../../platform/keybinding/common/keybinding.js';
import { ILabelService } from '../../../../../platform/label/common/label.js';
import { FileReferences, OneReference, ReferencesModel } from '../referencesModel.js';
export type TreeElement = FileReferences | OneReference;
export declare class DataSource implements IAsyncDataSource<ReferencesModel | FileReferences, TreeElement> {
    private readonly _resolverService;
    constructor(_resolverService: ITextModelService);
    hasChildren(element: ReferencesModel | FileReferences | TreeElement): boolean;
    getChildren(element: ReferencesModel | FileReferences | TreeElement): TreeElement[] | Promise<TreeElement[]>;
}
export declare class Delegate implements IListVirtualDelegate<TreeElement> {
    getHeight(): number;
    getTemplateId(element: FileReferences | OneReference): string;
}
export declare class StringRepresentationProvider implements IKeyboardNavigationLabelProvider<TreeElement> {
    private readonly _keybindingService;
    constructor(_keybindingService: IKeybindingService);
    getKeyboardNavigationLabel(element: TreeElement): {
        toString(): string;
    };
    mightProducePrintableCharacter(event: IKeyboardEvent): boolean;
}
export declare class IdentityProvider implements IIdentityProvider<TreeElement> {
    getId(element: TreeElement): {
        toString(): string;
    };
}
declare class FileReferencesTemplate extends Disposable {
    private readonly _labelService;
    readonly file: IconLabel;
    readonly badge: CountBadge;
    constructor(container: HTMLElement, _labelService: ILabelService);
    set(element: FileReferences, matches: IMatch[]): void;
}
export declare class FileReferencesRenderer implements ITreeRenderer<FileReferences, FuzzyScore, FileReferencesTemplate> {
    private readonly _instantiationService;
    static readonly id = "FileReferencesRenderer";
    readonly templateId: string;
    constructor(_instantiationService: IInstantiationService);
    renderTemplate(container: HTMLElement): FileReferencesTemplate;
    renderElement(node: ITreeNode<FileReferences, FuzzyScore>, index: number, template: FileReferencesTemplate): void;
    disposeTemplate(templateData: FileReferencesTemplate): void;
}
declare class OneReferenceTemplate extends Disposable {
    readonly label: HighlightedLabel;
    constructor(container: HTMLElement);
    set(element: OneReference, score?: FuzzyScore): void;
}
export declare class OneReferenceRenderer implements ITreeRenderer<OneReference, FuzzyScore, OneReferenceTemplate> {
    static readonly id = "OneReferenceRenderer";
    readonly templateId: string;
    renderTemplate(container: HTMLElement): OneReferenceTemplate;
    renderElement(node: ITreeNode<OneReference, FuzzyScore>, index: number, templateData: OneReferenceTemplate): void;
    disposeTemplate(templateData: OneReferenceTemplate): void;
}
export declare class AccessibilityProvider implements IListAccessibilityProvider<FileReferences | OneReference> {
    getWidgetAriaLabel(): string;
    getAriaLabel(element: FileReferences | OneReference): string | null;
}
export {};
