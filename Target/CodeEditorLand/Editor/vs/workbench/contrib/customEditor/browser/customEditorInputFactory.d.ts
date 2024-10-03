import { Disposable } from '../../../../base/common/lifecycle.js';
import { URI, UriComponents } from '../../../../base/common/uri.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { EditorInput } from '../../../common/editor/editorInput.js';
import { CustomEditorInput } from './customEditorInput.js';
import { ICustomEditorService } from '../common/customEditor.js';
import { IWebviewService } from '../../webview/browser/webview.js';
import { DeserializedWebview, SerializedWebview, SerializedWebviewOptions, WebviewEditorInputSerializer } from '../../webviewPanel/browser/webviewEditorInputSerializer.js';
import { IWebviewWorkbenchService } from '../../webviewPanel/browser/webviewWorkbenchService.js';
import { IWorkingCopyBackupMeta, IWorkingCopyIdentifier } from '../../../services/workingCopy/common/workingCopy.js';
import { IWorkingCopyBackupService } from '../../../services/workingCopy/common/workingCopyBackup.js';
import { IWorkingCopyEditorHandler, IWorkingCopyEditorService } from '../../../services/workingCopy/common/workingCopyEditorService.js';
export interface CustomDocumentBackupData extends IWorkingCopyBackupMeta {
    readonly viewType: string;
    readonly editorResource: UriComponents;
    backupId: string;
    readonly extension: undefined | {
        readonly location: UriComponents;
        readonly id: string;
    };
    readonly webview: {
        readonly origin: string | undefined;
        readonly options: SerializedWebviewOptions;
        readonly state: any;
    };
}
interface SerializedCustomEditor extends SerializedWebview {
    readonly editorResource: UriComponents;
    readonly dirty: boolean;
    readonly backupId?: string;
}
interface DeserializedCustomEditor extends DeserializedWebview {
    readonly editorResource: URI;
    readonly dirty: boolean;
    readonly backupId?: string;
}
export declare class CustomEditorInputSerializer extends WebviewEditorInputSerializer {
    private readonly _instantiationService;
    private readonly _webviewService;
    static readonly ID = "workbench.editors.webviewEditor";
    constructor(webviewWorkbenchService: IWebviewWorkbenchService, _instantiationService: IInstantiationService, _webviewService: IWebviewService);
    serialize(input: CustomEditorInput): string | undefined;
    protected fromJson(data: SerializedCustomEditor): DeserializedCustomEditor;
    deserialize(_instantiationService: IInstantiationService, serializedEditorInput: string): CustomEditorInput;
}
export declare class ComplexCustomWorkingCopyEditorHandler extends Disposable implements IWorkbenchContribution, IWorkingCopyEditorHandler {
    private readonly _instantiationService;
    private readonly _workingCopyBackupService;
    private readonly _webviewService;
    static readonly ID = "workbench.contrib.complexCustomWorkingCopyEditorHandler";
    constructor(_instantiationService: IInstantiationService, _workingCopyEditorService: IWorkingCopyEditorService, _workingCopyBackupService: IWorkingCopyBackupService, _webviewService: IWebviewService, _customEditorService: ICustomEditorService);
    handles(workingCopy: IWorkingCopyIdentifier): boolean;
    isOpen(workingCopy: IWorkingCopyIdentifier, editor: EditorInput): boolean;
    createEditor(workingCopy: IWorkingCopyIdentifier): Promise<EditorInput>;
}
export {};
