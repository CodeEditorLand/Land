import { createProxyIdentifier } from '../../services/extensions/common/proxyIdentifier.js';
export var TextEditorRevealType;
(function (TextEditorRevealType) {
    TextEditorRevealType[TextEditorRevealType["Default"] = 0] = "Default";
    TextEditorRevealType[TextEditorRevealType["InCenter"] = 1] = "InCenter";
    TextEditorRevealType[TextEditorRevealType["InCenterIfOutsideViewport"] = 2] = "InCenterIfOutsideViewport";
    TextEditorRevealType[TextEditorRevealType["AtTop"] = 3] = "AtTop";
})(TextEditorRevealType || (TextEditorRevealType = {}));
export var WebviewEditorCapabilities;
(function (WebviewEditorCapabilities) {
    WebviewEditorCapabilities[WebviewEditorCapabilities["Editable"] = 0] = "Editable";
    WebviewEditorCapabilities[WebviewEditorCapabilities["SupportsHotExit"] = 1] = "SupportsHotExit";
})(WebviewEditorCapabilities || (WebviewEditorCapabilities = {}));
export var CellOutputKind;
(function (CellOutputKind) {
    CellOutputKind[CellOutputKind["Text"] = 1] = "Text";
    CellOutputKind[CellOutputKind["Error"] = 2] = "Error";
    CellOutputKind[CellOutputKind["Rich"] = 3] = "Rich";
})(CellOutputKind || (CellOutputKind = {}));
export var NotebookEditorRevealType;
(function (NotebookEditorRevealType) {
    NotebookEditorRevealType[NotebookEditorRevealType["Default"] = 0] = "Default";
    NotebookEditorRevealType[NotebookEditorRevealType["InCenter"] = 1] = "InCenter";
    NotebookEditorRevealType[NotebookEditorRevealType["InCenterIfOutsideViewport"] = 2] = "InCenterIfOutsideViewport";
    NotebookEditorRevealType[NotebookEditorRevealType["AtTop"] = 3] = "AtTop";
})(NotebookEditorRevealType || (NotebookEditorRevealType = {}));
export var CandidatePortSource;
(function (CandidatePortSource) {
    CandidatePortSource[CandidatePortSource["None"] = 0] = "None";
    CandidatePortSource[CandidatePortSource["Process"] = 1] = "Process";
    CandidatePortSource[CandidatePortSource["Output"] = 2] = "Output";
    CandidatePortSource[CandidatePortSource["Hybrid"] = 3] = "Hybrid";
})(CandidatePortSource || (CandidatePortSource = {}));
export class IdObject {
    static { this._n = 0; }
    static mixin(object) {
        object._id = IdObject._n++;
        return object;
    }
}
export const MainContext = {
    MainThreadAuthentication: createProxyIdentifier('MainThreadAuthentication'),
    MainThreadBulkEdits: createProxyIdentifier('MainThreadBulkEdits'),
    MainThreadLanguageModels: createProxyIdentifier('MainThreadLanguageModels'),
    MainThreadEmbeddings: createProxyIdentifier('MainThreadEmbeddings'),
    MainThreadChatAgents2: createProxyIdentifier('MainThreadChatAgents2'),
    MainThreadCodeMapper: createProxyIdentifier('MainThreadCodeMapper'),
    MainThreadChatVariables: createProxyIdentifier('MainThreadChatVariables'),
    MainThreadLanguageModelTools: createProxyIdentifier('MainThreadChatSkills'),
    MainThreadClipboard: createProxyIdentifier('MainThreadClipboard'),
    MainThreadCommands: createProxyIdentifier('MainThreadCommands'),
    MainThreadComments: createProxyIdentifier('MainThreadComments'),
    MainThreadConfiguration: createProxyIdentifier('MainThreadConfiguration'),
    MainThreadConsole: createProxyIdentifier('MainThreadConsole'),
    MainThreadDebugService: createProxyIdentifier('MainThreadDebugService'),
    MainThreadDecorations: createProxyIdentifier('MainThreadDecorations'),
    MainThreadDiagnostics: createProxyIdentifier('MainThreadDiagnostics'),
    MainThreadDialogs: createProxyIdentifier('MainThreadDiaglogs'),
    MainThreadDocuments: createProxyIdentifier('MainThreadDocuments'),
    MainThreadDocumentContentProviders: createProxyIdentifier('MainThreadDocumentContentProviders'),
    MainThreadTextEditors: createProxyIdentifier('MainThreadTextEditors'),
    MainThreadEditorInsets: createProxyIdentifier('MainThreadEditorInsets'),
    MainThreadEditorTabs: createProxyIdentifier('MainThreadEditorTabs'),
    MainThreadErrors: createProxyIdentifier('MainThreadErrors'),
    MainThreadTreeViews: createProxyIdentifier('MainThreadTreeViews'),
    MainThreadDownloadService: createProxyIdentifier('MainThreadDownloadService'),
    MainThreadLanguageFeatures: createProxyIdentifier('MainThreadLanguageFeatures'),
    MainThreadLanguages: createProxyIdentifier('MainThreadLanguages'),
    MainThreadLogger: createProxyIdentifier('MainThreadLogger'),
    MainThreadMessageService: createProxyIdentifier('MainThreadMessageService'),
    MainThreadOutputService: createProxyIdentifier('MainThreadOutputService'),
    MainThreadProgress: createProxyIdentifier('MainThreadProgress'),
    MainThreadQuickDiff: createProxyIdentifier('MainThreadQuickDiff'),
    MainThreadQuickOpen: createProxyIdentifier('MainThreadQuickOpen'),
    MainThreadStatusBar: createProxyIdentifier('MainThreadStatusBar'),
    MainThreadSecretState: createProxyIdentifier('MainThreadSecretState'),
    MainThreadStorage: createProxyIdentifier('MainThreadStorage'),
    MainThreadSpeech: createProxyIdentifier('MainThreadSpeechProvider'),
    MainThreadTelemetry: createProxyIdentifier('MainThreadTelemetry'),
    MainThreadTerminalService: createProxyIdentifier('MainThreadTerminalService'),
    MainThreadTerminalShellIntegration: createProxyIdentifier('MainThreadTerminalShellIntegration'),
    MainThreadWebviews: createProxyIdentifier('MainThreadWebviews'),
    MainThreadWebviewPanels: createProxyIdentifier('MainThreadWebviewPanels'),
    MainThreadWebviewViews: createProxyIdentifier('MainThreadWebviewViews'),
    MainThreadCustomEditors: createProxyIdentifier('MainThreadCustomEditors'),
    MainThreadUrls: createProxyIdentifier('MainThreadUrls'),
    MainThreadUriOpeners: createProxyIdentifier('MainThreadUriOpeners'),
    MainThreadProfileContentHandlers: createProxyIdentifier('MainThreadProfileContentHandlers'),
    MainThreadWorkspace: createProxyIdentifier('MainThreadWorkspace'),
    MainThreadFileSystem: createProxyIdentifier('MainThreadFileSystem'),
    MainThreadFileSystemEventService: createProxyIdentifier('MainThreadFileSystemEventService'),
    MainThreadExtensionService: createProxyIdentifier('MainThreadExtensionService'),
    MainThreadSCM: createProxyIdentifier('MainThreadSCM'),
    MainThreadSearch: createProxyIdentifier('MainThreadSearch'),
    MainThreadShare: createProxyIdentifier('MainThreadShare'),
    MainThreadTask: createProxyIdentifier('MainThreadTask'),
    MainThreadWindow: createProxyIdentifier('MainThreadWindow'),
    MainThreadLabelService: createProxyIdentifier('MainThreadLabelService'),
    MainThreadNotebook: createProxyIdentifier('MainThreadNotebook'),
    MainThreadNotebookDocuments: createProxyIdentifier('MainThreadNotebookDocumentsShape'),
    MainThreadNotebookEditors: createProxyIdentifier('MainThreadNotebookEditorsShape'),
    MainThreadNotebookKernels: createProxyIdentifier('MainThreadNotebookKernels'),
    MainThreadNotebookRenderers: createProxyIdentifier('MainThreadNotebookRenderers'),
    MainThreadInteractive: createProxyIdentifier('MainThreadInteractive'),
    MainThreadTheming: createProxyIdentifier('MainThreadTheming'),
    MainThreadTunnelService: createProxyIdentifier('MainThreadTunnelService'),
    MainThreadManagedSockets: createProxyIdentifier('MainThreadManagedSockets'),
    MainThreadTimeline: createProxyIdentifier('MainThreadTimeline'),
    MainThreadTesting: createProxyIdentifier('MainThreadTesting'),
    MainThreadLocalization: createProxyIdentifier('MainThreadLocalizationShape'),
    MainThreadAiRelatedInformation: createProxyIdentifier('MainThreadAiRelatedInformation'),
    MainThreadAiEmbeddingVector: createProxyIdentifier('MainThreadAiEmbeddingVector')
};
export const ExtHostContext = {
    ExtHostCodeMapper: createProxyIdentifier('ExtHostCodeMapper'),
    ExtHostCommands: createProxyIdentifier('ExtHostCommands'),
    ExtHostConfiguration: createProxyIdentifier('ExtHostConfiguration'),
    ExtHostDiagnostics: createProxyIdentifier('ExtHostDiagnostics'),
    ExtHostDebugService: createProxyIdentifier('ExtHostDebugService'),
    ExtHostDecorations: createProxyIdentifier('ExtHostDecorations'),
    ExtHostDocumentsAndEditors: createProxyIdentifier('ExtHostDocumentsAndEditors'),
    ExtHostDocuments: createProxyIdentifier('ExtHostDocuments'),
    ExtHostDocumentContentProviders: createProxyIdentifier('ExtHostDocumentContentProviders'),
    ExtHostDocumentSaveParticipant: createProxyIdentifier('ExtHostDocumentSaveParticipant'),
    ExtHostEditors: createProxyIdentifier('ExtHostEditors'),
    ExtHostTreeViews: createProxyIdentifier('ExtHostTreeViews'),
    ExtHostFileSystem: createProxyIdentifier('ExtHostFileSystem'),
    ExtHostFileSystemInfo: createProxyIdentifier('ExtHostFileSystemInfo'),
    ExtHostFileSystemEventService: createProxyIdentifier('ExtHostFileSystemEventService'),
    ExtHostLanguages: createProxyIdentifier('ExtHostLanguages'),
    ExtHostLanguageFeatures: createProxyIdentifier('ExtHostLanguageFeatures'),
    ExtHostQuickOpen: createProxyIdentifier('ExtHostQuickOpen'),
    ExtHostQuickDiff: createProxyIdentifier('ExtHostQuickDiff'),
    ExtHostStatusBar: createProxyIdentifier('ExtHostStatusBar'),
    ExtHostShare: createProxyIdentifier('ExtHostShare'),
    ExtHostExtensionService: createProxyIdentifier('ExtHostExtensionService'),
    ExtHostLogLevelServiceShape: createProxyIdentifier('ExtHostLogLevelServiceShape'),
    ExtHostTerminalService: createProxyIdentifier('ExtHostTerminalService'),
    ExtHostTerminalShellIntegration: createProxyIdentifier('ExtHostTerminalShellIntegration'),
    ExtHostSCM: createProxyIdentifier('ExtHostSCM'),
    ExtHostSearch: createProxyIdentifier('ExtHostSearch'),
    ExtHostTask: createProxyIdentifier('ExtHostTask'),
    ExtHostWorkspace: createProxyIdentifier('ExtHostWorkspace'),
    ExtHostWindow: createProxyIdentifier('ExtHostWindow'),
    ExtHostWebviews: createProxyIdentifier('ExtHostWebviews'),
    ExtHostWebviewPanels: createProxyIdentifier('ExtHostWebviewPanels'),
    ExtHostCustomEditors: createProxyIdentifier('ExtHostCustomEditors'),
    ExtHostWebviewViews: createProxyIdentifier('ExtHostWebviewViews'),
    ExtHostEditorInsets: createProxyIdentifier('ExtHostEditorInsets'),
    ExtHostEditorTabs: createProxyIdentifier('ExtHostEditorTabs'),
    ExtHostProgress: createProxyIdentifier('ExtHostProgress'),
    ExtHostComments: createProxyIdentifier('ExtHostComments'),
    ExtHostSecretState: createProxyIdentifier('ExtHostSecretState'),
    ExtHostStorage: createProxyIdentifier('ExtHostStorage'),
    ExtHostUrls: createProxyIdentifier('ExtHostUrls'),
    ExtHostUriOpeners: createProxyIdentifier('ExtHostUriOpeners'),
    ExtHostProfileContentHandlers: createProxyIdentifier('ExtHostProfileContentHandlers'),
    ExtHostOutputService: createProxyIdentifier('ExtHostOutputService'),
    ExtHostLabelService: createProxyIdentifier('ExtHostLabelService'),
    ExtHostNotebook: createProxyIdentifier('ExtHostNotebook'),
    ExtHostNotebookDocuments: createProxyIdentifier('ExtHostNotebookDocuments'),
    ExtHostNotebookEditors: createProxyIdentifier('ExtHostNotebookEditors'),
    ExtHostNotebookKernels: createProxyIdentifier('ExtHostNotebookKernels'),
    ExtHostNotebookRenderers: createProxyIdentifier('ExtHostNotebookRenderers'),
    ExtHostNotebookDocumentSaveParticipant: createProxyIdentifier('ExtHostNotebookDocumentSaveParticipant'),
    ExtHostInteractive: createProxyIdentifier('ExtHostInteractive'),
    ExtHostChatAgents2: createProxyIdentifier('ExtHostChatAgents'),
    ExtHostChatVariables: createProxyIdentifier('ExtHostChatVariables'),
    ExtHostLanguageModelTools: createProxyIdentifier('ExtHostChatSkills'),
    ExtHostChatProvider: createProxyIdentifier('ExtHostChatProvider'),
    ExtHostSpeech: createProxyIdentifier('ExtHostSpeech'),
    ExtHostEmbeddings: createProxyIdentifier('ExtHostEmbeddings'),
    ExtHostAiRelatedInformation: createProxyIdentifier('ExtHostAiRelatedInformation'),
    ExtHostAiEmbeddingVector: createProxyIdentifier('ExtHostAiEmbeddingVector'),
    ExtHostTheming: createProxyIdentifier('ExtHostTheming'),
    ExtHostTunnelService: createProxyIdentifier('ExtHostTunnelService'),
    ExtHostManagedSockets: createProxyIdentifier('ExtHostManagedSockets'),
    ExtHostAuthentication: createProxyIdentifier('ExtHostAuthentication'),
    ExtHostTimeline: createProxyIdentifier('ExtHostTimeline'),
    ExtHostTesting: createProxyIdentifier('ExtHostTesting'),
    ExtHostTelemetry: createProxyIdentifier('ExtHostTelemetry'),
    ExtHostLocalization: createProxyIdentifier('ExtHostLocalization')
};
