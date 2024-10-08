import './standaloneQuickInput.css';
import { Event } from '../../../../base/common/event.js';
import { ICodeEditor, IOverlayWidget, IOverlayWidgetPosition } from '../../../browser/editorBrowser.js';
import { IEditorContribution } from '../../../common/editorCommon.js';
import { IQuickInputService, IQuickPickItem, IQuickPick, IInputBox, IQuickNavigateConfiguration, IPickOptions, QuickPickInput, IInputOptions, IQuickWidget } from '../../../../platform/quickinput/common/quickInput.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ICodeEditorService } from '../../../browser/services/codeEditorService.js';
export declare class StandaloneQuickInputService implements IQuickInputService {
    private readonly instantiationService;
    private readonly codeEditorService;
    readonly _serviceBrand: undefined;
    private mapEditorToService;
    private get activeService();
    get currentQuickInput(): import("../../../../platform/quickinput/common/quickInput.js").IQuickInput | undefined;
    get quickAccess(): import("../../../../platform/quickinput/common/quickAccess").IQuickAccessController;
    get backButton(): import("../../../../platform/quickinput/common/quickInput.js").IQuickInputButton;
    get onShow(): Event<void>;
    get onHide(): Event<void>;
    constructor(instantiationService: IInstantiationService, codeEditorService: ICodeEditorService);
    pick<T extends IQuickPickItem, O extends IPickOptions<T>>(picks: Promise<QuickPickInput<T>[]> | QuickPickInput<T>[], options?: O, token?: CancellationToken): Promise<(O extends {
        canPickMany: true;
    } ? T[] : T) | undefined>;
    input(options?: IInputOptions | undefined, token?: CancellationToken | undefined): Promise<string | undefined>;
    createQuickPick<T extends IQuickPickItem>(options: {
        useSeparators: true;
    }): IQuickPick<T, {
        useSeparators: true;
    }>;
    createQuickPick<T extends IQuickPickItem>(options?: {
        useSeparators: boolean;
    }): IQuickPick<T, {
        useSeparators: false;
    }>;
    createInputBox(): IInputBox;
    createQuickWidget(): IQuickWidget;
    focus(): void;
    toggle(): void;
    navigate(next: boolean, quickNavigate?: IQuickNavigateConfiguration | undefined): void;
    accept(): Promise<void>;
    back(): Promise<void>;
    cancel(): Promise<void>;
}
export declare class QuickInputEditorContribution implements IEditorContribution {
    private editor;
    static readonly ID = "editor.controller.quickInput";
    static get(editor: ICodeEditor): QuickInputEditorContribution | null;
    readonly widget: QuickInputEditorWidget;
    constructor(editor: ICodeEditor);
    dispose(): void;
}
export declare class QuickInputEditorWidget implements IOverlayWidget {
    private codeEditor;
    private static readonly ID;
    private domNode;
    constructor(codeEditor: ICodeEditor);
    getId(): string;
    getDomNode(): HTMLElement;
    getPosition(): IOverlayWidgetPosition | null;
    dispose(): void;
}
