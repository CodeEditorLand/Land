import { ICodeEditor } from '../../browser/editorBrowser.js';
import { AbstractCodeEditorService } from '../../browser/services/abstractCodeEditorService.js';
import { IContextKeyService } from '../../../platform/contextkey/common/contextkey.js';
import { IThemeService } from '../../../platform/theme/common/themeService.js';
export declare class StandaloneCodeEditorService extends AbstractCodeEditorService {
    private readonly _editorIsOpen;
    private _activeCodeEditor;
    constructor(contextKeyService: IContextKeyService, themeService: IThemeService);
    private _checkContextKey;
    setActiveCodeEditor(activeCodeEditor: ICodeEditor | null): void;
    getActiveCodeEditor(): ICodeEditor | null;
    private doOpenEditor;
    private findModel;
}
