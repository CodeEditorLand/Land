import { IconLabel } from '../../../../base/browser/ui/iconLabel/iconLabel.js';
import { IListRenderer } from '../../../../base/browser/ui/list/list.js';
import { Event } from '../../../../base/common/event.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { ICodeEditor } from '../../../browser/editorBrowser.js';
import { IModelService } from '../../../common/services/model.js';
import { ILanguageService } from '../../../common/languages/language.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { CompletionItem } from './suggest.js';
export declare function getAriaId(index: number): string;
export interface ISuggestionTemplateData {
    readonly root: HTMLElement;
    readonly left: HTMLElement;
    readonly right: HTMLElement;
    readonly icon: HTMLElement;
    readonly colorspan: HTMLElement;
    readonly iconLabel: IconLabel;
    readonly iconContainer: HTMLElement;
    readonly parametersLabel: HTMLElement;
    readonly qualifierLabel: HTMLElement;
    readonly detailsLabel: HTMLElement;
    readonly readMore: HTMLElement;
    readonly disposables: DisposableStore;
    readonly configureFont: () => void;
}
export declare class ItemRenderer implements IListRenderer<CompletionItem, ISuggestionTemplateData> {
    private readonly _editor;
    private readonly _modelService;
    private readonly _languageService;
    private readonly _themeService;
    private readonly _onDidToggleDetails;
    readonly onDidToggleDetails: Event<void>;
    readonly templateId = "suggestion";
    constructor(_editor: ICodeEditor, _modelService: IModelService, _languageService: ILanguageService, _themeService: IThemeService);
    dispose(): void;
    renderTemplate(container: HTMLElement): ISuggestionTemplateData;
    renderElement(element: CompletionItem, index: number, data: ISuggestionTemplateData): void;
    disposeTemplate(templateData: ISuggestionTemplateData): void;
}
