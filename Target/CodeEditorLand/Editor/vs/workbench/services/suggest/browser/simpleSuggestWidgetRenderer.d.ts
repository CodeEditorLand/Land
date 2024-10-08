import { IconLabel } from '../../../../base/browser/ui/iconLabel/iconLabel.js';
import { IListRenderer } from '../../../../base/browser/ui/list/list.js';
import { SimpleCompletionItem } from './simpleCompletionItem.js';
import { Event } from '../../../../base/common/event.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
export declare function getAriaId(index: number): string;
export interface ISimpleSuggestionTemplateData {
    readonly root: HTMLElement;
    /**
     * Flexbox
     * < ------------- left ------------ >     < --- right -- >
     * <icon><label><signature><qualifier>     <type><readmore>
     */
    readonly left: HTMLElement;
    readonly right: HTMLElement;
    readonly icon: HTMLElement;
    readonly colorspan: HTMLElement;
    readonly iconLabel: IconLabel;
    readonly iconContainer: HTMLElement;
    readonly parametersLabel: HTMLElement;
    readonly qualifierLabel: HTMLElement;
    /**
     * Showing either `CompletionItem#details` or `CompletionItemLabel#type`
     */
    readonly detailsLabel: HTMLElement;
    readonly disposables: DisposableStore;
}
export interface ISimpleSuggestWidgetFontInfo {
    fontFamily: string;
    fontSize: number;
    lineHeight: number;
    fontWeight: string;
    letterSpacing: number;
}
export declare class SimpleSuggestWidgetItemRenderer implements IListRenderer<SimpleCompletionItem, ISimpleSuggestionTemplateData> {
    private readonly _getFontInfo;
    private readonly _onDidToggleDetails;
    readonly onDidToggleDetails: Event<void>;
    readonly templateId = "suggestion";
    constructor(_getFontInfo: () => ISimpleSuggestWidgetFontInfo);
    dispose(): void;
    renderTemplate(container: HTMLElement): ISimpleSuggestionTemplateData;
    renderElement(element: SimpleCompletionItem, index: number, data: ISimpleSuggestionTemplateData): void;
    disposeTemplate(templateData: ISimpleSuggestionTemplateData): void;
}
