import { Disposable } from '../../../../base/common/lifecycle.js';
import { ICodeEditor } from '../../../../editor/browser/editorBrowser.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IPreferencesService } from '../../../services/preferences/common/preferences.js';
export declare class SettingsEditorContribution extends Disposable {
    private readonly editor;
    private readonly instantiationService;
    private readonly preferencesService;
    private readonly workspaceContextService;
    static readonly ID: string;
    private currentRenderer;
    private readonly disposables;
    constructor(editor: ICodeEditor, instantiationService: IInstantiationService, preferencesService: IPreferencesService, workspaceContextService: IWorkspaceContextService);
    private _createPreferencesRenderer;
}
