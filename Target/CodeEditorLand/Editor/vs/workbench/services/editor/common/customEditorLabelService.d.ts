import { Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
export declare class CustomEditorLabelService extends Disposable implements ICustomEditorLabelService {
    private readonly configurationService;
    private readonly workspaceContextService;
    readonly _serviceBrand: undefined;
    static readonly SETTING_ID_PATTERNS = "workbench.editor.customLabels.patterns";
    static readonly SETTING_ID_ENABLED = "workbench.editor.customLabels.enabled";
    private readonly _onDidChange;
    readonly onDidChange: Event<void>;
    private patterns;
    private enabled;
    private cache;
    constructor(configurationService: IConfigurationService, workspaceContextService: IWorkspaceContextService);
    private registerListeners;
    private storeEnablementState;
    private _templateRegexValidation;
    private storeCustomPatterns;
    private patternWeight;
    getName(resource: URI): string | undefined;
    private applyPatterns;
    private readonly _parsedTemplateExpression;
    private readonly _filenameCaptureExpression;
    private applyTemplate;
    private removeLeadingDot;
    private getNthDirname;
    private getExtnames;
    private getNthExtname;
    private getNthFragment;
}
export declare const ICustomEditorLabelService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ICustomEditorLabelService>;
export interface ICustomEditorLabelService {
    readonly _serviceBrand: undefined;
    readonly onDidChange: Event<void>;
    getName(resource: URI): string | undefined;
}
