import { ICodeEditor } from '../../../../editor/browser/editorBrowser.js';
import { IEditorContribution } from '../../../../editor/common/editorCommon.js';
import { IAccessibilitySignalService } from '../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js';
import { IContextKeyService, RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
export declare class InlayHintsAccessibility implements IEditorContribution {
    private readonly _editor;
    private readonly _accessibilitySignalService;
    private readonly _instaService;
    static readonly IsReading: RawContextKey<boolean>;
    static readonly ID: string;
    static get(editor: ICodeEditor): InlayHintsAccessibility | undefined;
    private readonly _ariaElement;
    private readonly _ctxIsReading;
    private readonly _sessionDispoosables;
    constructor(_editor: ICodeEditor, contextKeyService: IContextKeyService, _accessibilitySignalService: IAccessibilitySignalService, _instaService: IInstantiationService);
    dispose(): void;
    private _reset;
    private _read;
    startInlayHintsReading(): void;
    stopInlayHintsReading(): void;
}
