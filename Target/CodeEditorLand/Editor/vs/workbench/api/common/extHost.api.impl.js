/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { CancellationTokenSource } from '../../../base/common/cancellation.js';
import * as errors from '../../../base/common/errors.js';
import { Emitter, Event } from '../../../base/common/event.js';
import { combinedDisposable } from '../../../base/common/lifecycle.js';
import { Schemas, matchesScheme } from '../../../base/common/network.js';
import Severity from '../../../base/common/severity.js';
import { URI } from '../../../base/common/uri.js';
import { TextEditorCursorStyle } from '../../../editor/common/config/editorOptions.js';
import { score, targetsNotebooks } from '../../../editor/common/languageSelector.js';
import * as languageConfiguration from '../../../editor/common/languages/languageConfiguration.js';
import { OverviewRulerLane } from '../../../editor/common/model.js';
import { ExtensionIdentifierSet } from '../../../platform/extensions/common/extensions.js';
import * as files from '../../../platform/files/common/files.js';
import { ILogService, ILoggerService, LogLevel } from '../../../platform/log/common/log.js';
import { getRemoteName } from '../../../platform/remote/common/remoteHosts.js';
import { TelemetryTrustedValue } from '../../../platform/telemetry/common/telemetryUtils.js';
import { EditSessionIdentityMatch } from '../../../platform/workspace/common/editSessions.js';
import { CandidatePortSource, ExtHostContext, MainContext } from './extHost.protocol.js';
import { ExtHostRelatedInformation } from './extHostAiRelatedInformation.js';
import { ExtHostApiCommands } from './extHostApiCommands.js';
import { IExtHostApiDeprecationService } from './extHostApiDeprecationService.js';
import { IExtHostAuthentication } from './extHostAuthentication.js';
import { ExtHostBulkEdits } from './extHostBulkEdits.js';
import { ExtHostChatAgents2 } from './extHostChatAgents2.js';
import { ExtHostChatVariables } from './extHostChatVariables.js';
import { ExtHostClipboard } from './extHostClipboard.js';
import { ExtHostEditorInsets } from './extHostCodeInsets.js';
import { IExtHostCommands } from './extHostCommands.js';
import { createExtHostComments } from './extHostComments.js';
import { IExtHostConfiguration } from './extHostConfiguration.js';
import { ExtHostCustomEditors } from './extHostCustomEditors.js';
import { IExtHostDebugService } from './extHostDebugService.js';
import { IExtHostDecorations } from './extHostDecorations.js';
import { ExtHostDiagnostics } from './extHostDiagnostics.js';
import { ExtHostDialogs } from './extHostDialogs.js';
import { ExtHostDocumentContentProvider } from './extHostDocumentContentProviders.js';
import { ExtHostDocumentSaveParticipant } from './extHostDocumentSaveParticipant.js';
import { ExtHostDocuments } from './extHostDocuments.js';
import { IExtHostDocumentsAndEditors } from './extHostDocumentsAndEditors.js';
import { IExtHostEditorTabs } from './extHostEditorTabs.js';
import { ExtHostEmbeddings } from './extHostEmbedding.js';
import { ExtHostAiEmbeddingVector } from './extHostEmbeddingVector.js';
import { Extension, IExtHostExtensionService } from './extHostExtensionService.js';
import { ExtHostFileSystem } from './extHostFileSystem.js';
import { IExtHostConsumerFileSystem } from './extHostFileSystemConsumer.js';
import { ExtHostFileSystemEventService } from './extHostFileSystemEventService.js';
import { IExtHostFileSystemInfo } from './extHostFileSystemInfo.js';
import { IExtHostInitDataService } from './extHostInitDataService.js';
import { ExtHostInteractive } from './extHostInteractive.js';
import { ExtHostLabelService } from './extHostLabelService.js';
import { ExtHostLanguageFeatures } from './extHostLanguageFeatures.js';
import { ExtHostLanguageModelTools } from './extHostLanguageModelTools.js';
import { IExtHostLanguageModels } from './extHostLanguageModels.js';
import { ExtHostLanguages } from './extHostLanguages.js';
import { IExtHostLocalizationService } from './extHostLocalizationService.js';
import { IExtHostManagedSockets } from './extHostManagedSockets.js';
import { ExtHostMessageService } from './extHostMessageService.js';
import { ExtHostNotebookController } from './extHostNotebook.js';
import { ExtHostNotebookDocumentSaveParticipant } from './extHostNotebookDocumentSaveParticipant.js';
import { ExtHostNotebookDocuments } from './extHostNotebookDocuments.js';
import { ExtHostNotebookEditors } from './extHostNotebookEditors.js';
import { ExtHostNotebookKernels } from './extHostNotebookKernels.js';
import { ExtHostNotebookRenderers } from './extHostNotebookRenderers.js';
import { IExtHostOutputService } from './extHostOutput.js';
import { ExtHostProfileContentHandlers } from './extHostProfileContentHandler.js';
import { ExtHostProgress } from './extHostProgress.js';
import { ExtHostQuickDiff } from './extHostQuickDiff.js';
import { createExtHostQuickOpen } from './extHostQuickOpen.js';
import { IExtHostRpcService } from './extHostRpcService.js';
import { ExtHostSCM } from './extHostSCM.js';
import { IExtHostSearch } from './extHostSearch.js';
import { IExtHostSecretState } from './extHostSecretState.js';
import { ExtHostShare } from './extHostShare.js';
import { ExtHostSpeech } from './extHostSpeech.js';
import { ExtHostStatusBar } from './extHostStatusBar.js';
import { IExtHostStorage } from './extHostStorage.js';
import { IExtensionStoragePaths } from './extHostStoragePaths.js';
import { IExtHostTask } from './extHostTask.js';
import { ExtHostTelemetryLogger, IExtHostTelemetry, isNewAppInstall } from './extHostTelemetry.js';
import { IExtHostTerminalService } from './extHostTerminalService.js';
import { IExtHostTerminalShellIntegration } from './extHostTerminalShellIntegration.js';
import { IExtHostTesting } from './extHostTesting.js';
import { ExtHostEditors } from './extHostTextEditors.js';
import { ExtHostTheming } from './extHostTheming.js';
import { ExtHostTimeline } from './extHostTimeline.js';
import { ExtHostTreeViews } from './extHostTreeViews.js';
import { IExtHostTunnelService } from './extHostTunnelService.js';
import * as typeConverters from './extHostTypeConverters.js';
import * as extHostTypes from './extHostTypes.js';
import { ExtHostUriOpeners } from './extHostUriOpener.js';
import { IURITransformerService } from './extHostUriTransformerService.js';
import { ExtHostUrls } from './extHostUrls.js';
import { ExtHostWebviews } from './extHostWebview.js';
import { ExtHostWebviewPanels } from './extHostWebviewPanels.js';
import { ExtHostWebviewViews } from './extHostWebviewView.js';
import { IExtHostWindow } from './extHostWindow.js';
import { IExtHostWorkspace } from './extHostWorkspace.js';
import { DebugConfigurationProviderTriggerKind } from '../../contrib/debug/common/debug.js';
import { UIKind } from '../../services/extensions/common/extensionHostProtocol.js';
import { checkProposedApiEnabled, isProposedApiEnabled } from '../../services/extensions/common/extensions.js';
import { ExcludeSettingOptions, TextSearchCompleteMessageType, TextSearchContextNew, TextSearchMatchNew } from '../../services/search/common/searchExtTypes.js';
import { ExtHostCodeMapper } from './extHostCodeMapper.js';
/**
 * This method instantiates and returns the extension API surface
 */
export function createApiFactoryAndRegisterActors(accessor) {
    // services
    const initData = accessor.get(IExtHostInitDataService);
    const extHostFileSystemInfo = accessor.get(IExtHostFileSystemInfo);
    const extHostConsumerFileSystem = accessor.get(IExtHostConsumerFileSystem);
    const extensionService = accessor.get(IExtHostExtensionService);
    const extHostWorkspace = accessor.get(IExtHostWorkspace);
    const extHostTelemetry = accessor.get(IExtHostTelemetry);
    const extHostConfiguration = accessor.get(IExtHostConfiguration);
    const uriTransformer = accessor.get(IURITransformerService);
    const rpcProtocol = accessor.get(IExtHostRpcService);
    const extHostStorage = accessor.get(IExtHostStorage);
    const extensionStoragePaths = accessor.get(IExtensionStoragePaths);
    const extHostLoggerService = accessor.get(ILoggerService);
    const extHostLogService = accessor.get(ILogService);
    const extHostTunnelService = accessor.get(IExtHostTunnelService);
    const extHostApiDeprecation = accessor.get(IExtHostApiDeprecationService);
    const extHostWindow = accessor.get(IExtHostWindow);
    const extHostSecretState = accessor.get(IExtHostSecretState);
    const extHostEditorTabs = accessor.get(IExtHostEditorTabs);
    const extHostManagedSockets = accessor.get(IExtHostManagedSockets);
    const extHostAuthentication = accessor.get(IExtHostAuthentication);
    const extHostLanguageModels = accessor.get(IExtHostLanguageModels);
    // register addressable instances
    rpcProtocol.set(ExtHostContext.ExtHostFileSystemInfo, extHostFileSystemInfo);
    rpcProtocol.set(ExtHostContext.ExtHostLogLevelServiceShape, extHostLoggerService);
    rpcProtocol.set(ExtHostContext.ExtHostWorkspace, extHostWorkspace);
    rpcProtocol.set(ExtHostContext.ExtHostConfiguration, extHostConfiguration);
    rpcProtocol.set(ExtHostContext.ExtHostExtensionService, extensionService);
    rpcProtocol.set(ExtHostContext.ExtHostStorage, extHostStorage);
    rpcProtocol.set(ExtHostContext.ExtHostTunnelService, extHostTunnelService);
    rpcProtocol.set(ExtHostContext.ExtHostWindow, extHostWindow);
    rpcProtocol.set(ExtHostContext.ExtHostSecretState, extHostSecretState);
    rpcProtocol.set(ExtHostContext.ExtHostTelemetry, extHostTelemetry);
    rpcProtocol.set(ExtHostContext.ExtHostEditorTabs, extHostEditorTabs);
    rpcProtocol.set(ExtHostContext.ExtHostManagedSockets, extHostManagedSockets);
    rpcProtocol.set(ExtHostContext.ExtHostAuthentication, extHostAuthentication);
    rpcProtocol.set(ExtHostContext.ExtHostChatProvider, extHostLanguageModels);
    // automatically create and register addressable instances
    const extHostDecorations = rpcProtocol.set(ExtHostContext.ExtHostDecorations, accessor.get(IExtHostDecorations));
    const extHostDocumentsAndEditors = rpcProtocol.set(ExtHostContext.ExtHostDocumentsAndEditors, accessor.get(IExtHostDocumentsAndEditors));
    const extHostCommands = rpcProtocol.set(ExtHostContext.ExtHostCommands, accessor.get(IExtHostCommands));
    const extHostTerminalService = rpcProtocol.set(ExtHostContext.ExtHostTerminalService, accessor.get(IExtHostTerminalService));
    const extHostTerminalShellIntegration = rpcProtocol.set(ExtHostContext.ExtHostTerminalShellIntegration, accessor.get(IExtHostTerminalShellIntegration));
    const extHostDebugService = rpcProtocol.set(ExtHostContext.ExtHostDebugService, accessor.get(IExtHostDebugService));
    const extHostSearch = rpcProtocol.set(ExtHostContext.ExtHostSearch, accessor.get(IExtHostSearch));
    const extHostTask = rpcProtocol.set(ExtHostContext.ExtHostTask, accessor.get(IExtHostTask));
    const extHostOutputService = rpcProtocol.set(ExtHostContext.ExtHostOutputService, accessor.get(IExtHostOutputService));
    const extHostLocalization = rpcProtocol.set(ExtHostContext.ExtHostLocalization, accessor.get(IExtHostLocalizationService));
    // manually create and register addressable instances
    const extHostUrls = rpcProtocol.set(ExtHostContext.ExtHostUrls, new ExtHostUrls(rpcProtocol));
    const extHostDocuments = rpcProtocol.set(ExtHostContext.ExtHostDocuments, new ExtHostDocuments(rpcProtocol, extHostDocumentsAndEditors));
    const extHostDocumentContentProviders = rpcProtocol.set(ExtHostContext.ExtHostDocumentContentProviders, new ExtHostDocumentContentProvider(rpcProtocol, extHostDocumentsAndEditors, extHostLogService));
    const extHostDocumentSaveParticipant = rpcProtocol.set(ExtHostContext.ExtHostDocumentSaveParticipant, new ExtHostDocumentSaveParticipant(extHostLogService, extHostDocuments, rpcProtocol.getProxy(MainContext.MainThreadBulkEdits)));
    const extHostNotebook = rpcProtocol.set(ExtHostContext.ExtHostNotebook, new ExtHostNotebookController(rpcProtocol, extHostCommands, extHostDocumentsAndEditors, extHostDocuments, extHostConsumerFileSystem, extHostSearch, extHostLogService));
    const extHostNotebookDocuments = rpcProtocol.set(ExtHostContext.ExtHostNotebookDocuments, new ExtHostNotebookDocuments(extHostNotebook));
    const extHostNotebookEditors = rpcProtocol.set(ExtHostContext.ExtHostNotebookEditors, new ExtHostNotebookEditors(extHostLogService, extHostNotebook));
    const extHostNotebookKernels = rpcProtocol.set(ExtHostContext.ExtHostNotebookKernels, new ExtHostNotebookKernels(rpcProtocol, initData, extHostNotebook, extHostCommands, extHostLogService));
    const extHostNotebookRenderers = rpcProtocol.set(ExtHostContext.ExtHostNotebookRenderers, new ExtHostNotebookRenderers(rpcProtocol, extHostNotebook));
    const extHostNotebookDocumentSaveParticipant = rpcProtocol.set(ExtHostContext.ExtHostNotebookDocumentSaveParticipant, new ExtHostNotebookDocumentSaveParticipant(extHostLogService, extHostNotebook, rpcProtocol.getProxy(MainContext.MainThreadBulkEdits)));
    const extHostEditors = rpcProtocol.set(ExtHostContext.ExtHostEditors, new ExtHostEditors(rpcProtocol, extHostDocumentsAndEditors));
    const extHostTreeViews = rpcProtocol.set(ExtHostContext.ExtHostTreeViews, new ExtHostTreeViews(rpcProtocol.getProxy(MainContext.MainThreadTreeViews), extHostCommands, extHostLogService));
    const extHostEditorInsets = rpcProtocol.set(ExtHostContext.ExtHostEditorInsets, new ExtHostEditorInsets(rpcProtocol.getProxy(MainContext.MainThreadEditorInsets), extHostEditors, initData.remote));
    const extHostDiagnostics = rpcProtocol.set(ExtHostContext.ExtHostDiagnostics, new ExtHostDiagnostics(rpcProtocol, extHostLogService, extHostFileSystemInfo, extHostDocumentsAndEditors));
    const extHostLanguages = rpcProtocol.set(ExtHostContext.ExtHostLanguages, new ExtHostLanguages(rpcProtocol, extHostDocuments, extHostCommands.converter, uriTransformer));
    const extHostLanguageFeatures = rpcProtocol.set(ExtHostContext.ExtHostLanguageFeatures, new ExtHostLanguageFeatures(rpcProtocol, uriTransformer, extHostDocuments, extHostCommands, extHostDiagnostics, extHostLogService, extHostApiDeprecation, extHostTelemetry));
    const extHostCodeMapper = rpcProtocol.set(ExtHostContext.ExtHostCodeMapper, new ExtHostCodeMapper(rpcProtocol));
    const extHostFileSystem = rpcProtocol.set(ExtHostContext.ExtHostFileSystem, new ExtHostFileSystem(rpcProtocol, extHostLanguageFeatures));
    const extHostFileSystemEvent = rpcProtocol.set(ExtHostContext.ExtHostFileSystemEventService, new ExtHostFileSystemEventService(rpcProtocol, extHostLogService, extHostDocumentsAndEditors));
    const extHostQuickOpen = rpcProtocol.set(ExtHostContext.ExtHostQuickOpen, createExtHostQuickOpen(rpcProtocol, extHostWorkspace, extHostCommands));
    const extHostSCM = rpcProtocol.set(ExtHostContext.ExtHostSCM, new ExtHostSCM(rpcProtocol, extHostCommands, extHostDocuments, extHostLogService));
    const extHostQuickDiff = rpcProtocol.set(ExtHostContext.ExtHostQuickDiff, new ExtHostQuickDiff(rpcProtocol, uriTransformer));
    const extHostShare = rpcProtocol.set(ExtHostContext.ExtHostShare, new ExtHostShare(rpcProtocol, uriTransformer));
    const extHostComment = rpcProtocol.set(ExtHostContext.ExtHostComments, createExtHostComments(rpcProtocol, extHostCommands, extHostDocuments));
    const extHostProgress = rpcProtocol.set(ExtHostContext.ExtHostProgress, new ExtHostProgress(rpcProtocol.getProxy(MainContext.MainThreadProgress)));
    const extHostLabelService = rpcProtocol.set(ExtHostContext.ExtHostLabelService, new ExtHostLabelService(rpcProtocol));
    const extHostTheming = rpcProtocol.set(ExtHostContext.ExtHostTheming, new ExtHostTheming(rpcProtocol));
    const extHostTimeline = rpcProtocol.set(ExtHostContext.ExtHostTimeline, new ExtHostTimeline(rpcProtocol, extHostCommands));
    const extHostWebviews = rpcProtocol.set(ExtHostContext.ExtHostWebviews, new ExtHostWebviews(rpcProtocol, initData.remote, extHostWorkspace, extHostLogService, extHostApiDeprecation));
    const extHostWebviewPanels = rpcProtocol.set(ExtHostContext.ExtHostWebviewPanels, new ExtHostWebviewPanels(rpcProtocol, extHostWebviews, extHostWorkspace));
    const extHostCustomEditors = rpcProtocol.set(ExtHostContext.ExtHostCustomEditors, new ExtHostCustomEditors(rpcProtocol, extHostDocuments, extensionStoragePaths, extHostWebviews, extHostWebviewPanels));
    const extHostWebviewViews = rpcProtocol.set(ExtHostContext.ExtHostWebviewViews, new ExtHostWebviewViews(rpcProtocol, extHostWebviews));
    const extHostTesting = rpcProtocol.set(ExtHostContext.ExtHostTesting, accessor.get(IExtHostTesting));
    const extHostUriOpeners = rpcProtocol.set(ExtHostContext.ExtHostUriOpeners, new ExtHostUriOpeners(rpcProtocol));
    const extHostProfileContentHandlers = rpcProtocol.set(ExtHostContext.ExtHostProfileContentHandlers, new ExtHostProfileContentHandlers(rpcProtocol));
    rpcProtocol.set(ExtHostContext.ExtHostInteractive, new ExtHostInteractive(rpcProtocol, extHostNotebook, extHostDocumentsAndEditors, extHostCommands, extHostLogService));
    const extHostChatAgents2 = rpcProtocol.set(ExtHostContext.ExtHostChatAgents2, new ExtHostChatAgents2(rpcProtocol, extHostLogService, extHostCommands, extHostDocuments, extHostLanguageModels));
    const extHostChatVariables = rpcProtocol.set(ExtHostContext.ExtHostChatVariables, new ExtHostChatVariables(rpcProtocol));
    const extHostLanguageModelTools = rpcProtocol.set(ExtHostContext.ExtHostLanguageModelTools, new ExtHostLanguageModelTools(rpcProtocol));
    const extHostAiRelatedInformation = rpcProtocol.set(ExtHostContext.ExtHostAiRelatedInformation, new ExtHostRelatedInformation(rpcProtocol));
    const extHostAiEmbeddingVector = rpcProtocol.set(ExtHostContext.ExtHostAiEmbeddingVector, new ExtHostAiEmbeddingVector(rpcProtocol));
    const extHostStatusBar = rpcProtocol.set(ExtHostContext.ExtHostStatusBar, new ExtHostStatusBar(rpcProtocol, extHostCommands.converter));
    const extHostSpeech = rpcProtocol.set(ExtHostContext.ExtHostSpeech, new ExtHostSpeech(rpcProtocol));
    const extHostEmbeddings = rpcProtocol.set(ExtHostContext.ExtHostEmbeddings, new ExtHostEmbeddings(rpcProtocol));
    // Check that no named customers are missing
    const expected = Object.values(ExtHostContext);
    rpcProtocol.assertRegistered(expected);
    // Other instances
    const extHostBulkEdits = new ExtHostBulkEdits(rpcProtocol, extHostDocumentsAndEditors);
    const extHostClipboard = new ExtHostClipboard(rpcProtocol);
    const extHostMessageService = new ExtHostMessageService(rpcProtocol, extHostLogService);
    const extHostDialogs = new ExtHostDialogs(rpcProtocol);
    // Register API-ish commands
    ExtHostApiCommands.register(extHostCommands);
    return function (extension, extensionInfo, configProvider) {
        // Wraps an event with error handling and telemetry so that we know what extension fails
        // handling events. This will prevent us from reporting this as "our" error-telemetry and
        // allows for better blaming
        function _asExtensionEvent(actual) {
            return (listener, thisArgs, disposables) => {
                const handle = actual(e => {
                    try {
                        listener.call(thisArgs, e);
                    }
                    catch (err) {
                        errors.onUnexpectedExternalError(new Error(`[ExtensionListenerError] Extension '${extension.identifier.value}' FAILED to handle event: ${err.toString()}`, { cause: err }));
                        extHostTelemetry.onExtensionError(extension.identifier, err);
                    }
                });
                disposables?.push(handle);
                return handle;
            };
        }
        // Check document selectors for being overly generic. Technically this isn't a problem but
        // in practice many extensions say they support `fooLang` but need fs-access to do so. Those
        // extension should specify then the `file`-scheme, e.g. `{ scheme: 'fooLang', language: 'fooLang' }`
        // We only inform once, it is not a warning because we just want to raise awareness and because
        // we cannot say if the extension is doing it right or wrong...
        const checkSelector = (function () {
            let done = !extension.isUnderDevelopment;
            function informOnce() {
                if (!done) {
                    extHostLogService.info(`Extension '${extension.identifier.value}' uses a document selector without scheme. Learn more about this: https://go.microsoft.com/fwlink/?linkid=872305`);
                    done = true;
                }
            }
            return function perform(selector) {
                if (Array.isArray(selector)) {
                    selector.forEach(perform);
                }
                else if (typeof selector === 'string') {
                    informOnce();
                }
                else {
                    const filter = selector; // TODO: microsoft/TypeScript#42768
                    if (typeof filter.scheme === 'undefined') {
                        informOnce();
                    }
                    if (typeof filter.exclusive === 'boolean') {
                        checkProposedApiEnabled(extension, 'documentFiltersExclusive');
                    }
                }
                return selector;
            };
        })();
        const authentication = {
            getSession(providerId, scopes, options) {
                if (typeof options?.forceNewSession === 'object' && options.forceNewSession.learnMore) {
                    checkProposedApiEnabled(extension, 'authLearnMore');
                }
                return extHostAuthentication.getSession(extension, providerId, scopes, options);
            },
            getAccounts(providerId) {
                return extHostAuthentication.getAccounts(providerId);
            },
            // TODO: remove this after GHPR and Codespaces move off of it
            async hasSession(providerId, scopes) {
                checkProposedApiEnabled(extension, 'authSession');
                return !!(await extHostAuthentication.getSession(extension, providerId, scopes, { silent: true }));
            },
            get onDidChangeSessions() {
                return _asExtensionEvent(extHostAuthentication.getExtensionScopedSessionsEvent(extension.identifier.value));
            },
            registerAuthenticationProvider(id, label, provider, options) {
                return extHostAuthentication.registerAuthenticationProvider(id, label, provider, options);
            }
        };
        // namespace: commands
        const commands = {
            registerCommand(id, command, thisArgs) {
                return extHostCommands.registerCommand(true, id, command, thisArgs, undefined, extension);
            },
            registerTextEditorCommand(id, callback, thisArg) {
                return extHostCommands.registerCommand(true, id, (...args) => {
                    const activeTextEditor = extHostEditors.getActiveTextEditor();
                    if (!activeTextEditor) {
                        extHostLogService.warn('Cannot execute ' + id + ' because there is no active text editor.');
                        return undefined;
                    }
                    return activeTextEditor.edit((edit) => {
                        callback.apply(thisArg, [activeTextEditor, edit, ...args]);
                    }).then((result) => {
                        if (!result) {
                            extHostLogService.warn('Edits from command ' + id + ' were not applied.');
                        }
                    }, (err) => {
                        extHostLogService.warn('An error occurred while running command ' + id, err);
                    });
                }, undefined, undefined, extension);
            },
            registerDiffInformationCommand: (id, callback, thisArg) => {
                checkProposedApiEnabled(extension, 'diffCommand');
                return extHostCommands.registerCommand(true, id, async (...args) => {
                    const activeTextEditor = extHostDocumentsAndEditors.activeEditor(true);
                    if (!activeTextEditor) {
                        extHostLogService.warn('Cannot execute ' + id + ' because there is no active text editor.');
                        return undefined;
                    }
                    const diff = await extHostEditors.getDiffInformation(activeTextEditor.id);
                    callback.apply(thisArg, [diff, ...args]);
                }, undefined, undefined, extension);
            },
            executeCommand(id, ...args) {
                return extHostCommands.executeCommand(id, ...args);
            },
            getCommands(filterInternal = false) {
                return extHostCommands.getCommands(filterInternal);
            }
        };
        // namespace: env
        const env = {
            get machineId() { return initData.telemetryInfo.machineId; },
            get sessionId() { return initData.telemetryInfo.sessionId; },
            get language() { return initData.environment.appLanguage; },
            get appName() { return initData.environment.appName; },
            get appRoot() { return initData.environment.appRoot?.fsPath ?? ''; },
            get appHost() { return initData.environment.appHost; },
            get uriScheme() { return initData.environment.appUriScheme; },
            get clipboard() { return extHostClipboard.value; },
            get shell() {
                return extHostTerminalService.getDefaultShell(false);
            },
            get onDidChangeShell() {
                return _asExtensionEvent(extHostTerminalService.onDidChangeShell);
            },
            get isTelemetryEnabled() {
                return extHostTelemetry.getTelemetryConfiguration();
            },
            get onDidChangeTelemetryEnabled() {
                return _asExtensionEvent(extHostTelemetry.onDidChangeTelemetryEnabled);
            },
            get telemetryConfiguration() {
                checkProposedApiEnabled(extension, 'telemetry');
                return extHostTelemetry.getTelemetryDetails();
            },
            get onDidChangeTelemetryConfiguration() {
                checkProposedApiEnabled(extension, 'telemetry');
                return _asExtensionEvent(extHostTelemetry.onDidChangeTelemetryConfiguration);
            },
            get isNewAppInstall() {
                return isNewAppInstall(initData.telemetryInfo.firstSessionDate);
            },
            createTelemetryLogger(sender, options) {
                ExtHostTelemetryLogger.validateSender(sender);
                return extHostTelemetry.instantiateLogger(extension, sender, options);
            },
            openExternal(uri, options) {
                return extHostWindow.openUri(uri, {
                    allowTunneling: !!initData.remote.authority,
                    allowContributedOpeners: options?.allowContributedOpeners,
                });
            },
            async asExternalUri(uri) {
                if (uri.scheme === initData.environment.appUriScheme) {
                    return extHostUrls.createAppUri(uri);
                }
                try {
                    return await extHostWindow.asExternalUri(uri, { allowTunneling: !!initData.remote.authority });
                }
                catch (err) {
                    if (matchesScheme(uri, Schemas.http) || matchesScheme(uri, Schemas.https)) {
                        return uri;
                    }
                    throw err;
                }
            },
            get remoteName() {
                return getRemoteName(initData.remote.authority);
            },
            get remoteAuthority() {
                checkProposedApiEnabled(extension, 'resolvers');
                return initData.remote.authority;
            },
            get uiKind() {
                return initData.uiKind;
            },
            get logLevel() {
                return extHostLogService.getLevel();
            },
            get onDidChangeLogLevel() {
                return _asExtensionEvent(extHostLogService.onDidChangeLogLevel);
            },
            get appQuality() {
                checkProposedApiEnabled(extension, 'resolvers');
                return initData.quality;
            },
            get appCommit() {
                checkProposedApiEnabled(extension, 'resolvers');
                return initData.commit;
            },
        };
        if (!initData.environment.extensionTestsLocationURI) {
            // allow to patch env-function when running tests
            Object.freeze(env);
        }
        // namespace: tests
        const tests = {
            createTestController(provider, label, refreshHandler) {
                return extHostTesting.createTestController(extension, provider, label, refreshHandler);
            },
            createTestObserver() {
                checkProposedApiEnabled(extension, 'testObserver');
                return extHostTesting.createTestObserver();
            },
            runTests(provider) {
                checkProposedApiEnabled(extension, 'testObserver');
                return extHostTesting.runTests(provider);
            },
            registerTestFollowupProvider(provider) {
                checkProposedApiEnabled(extension, 'testObserver');
                return extHostTesting.registerTestFollowupProvider(provider);
            },
            get onDidChangeTestResults() {
                checkProposedApiEnabled(extension, 'testObserver');
                return _asExtensionEvent(extHostTesting.onResultsChanged);
            },
            get testResults() {
                checkProposedApiEnabled(extension, 'testObserver');
                return extHostTesting.results;
            },
        };
        // namespace: extensions
        const extensionKind = initData.remote.isRemote
            ? extHostTypes.ExtensionKind.Workspace
            : extHostTypes.ExtensionKind.UI;
        const extensions = {
            getExtension(extensionId, includeFromDifferentExtensionHosts) {
                if (!isProposedApiEnabled(extension, 'extensionsAny')) {
                    includeFromDifferentExtensionHosts = false;
                }
                const mine = extensionInfo.mine.getExtensionDescription(extensionId);
                if (mine) {
                    return new Extension(extensionService, extension.identifier, mine, extensionKind, false);
                }
                if (includeFromDifferentExtensionHosts) {
                    const foreign = extensionInfo.all.getExtensionDescription(extensionId);
                    if (foreign) {
                        return new Extension(extensionService, extension.identifier, foreign, extensionKind /* TODO@alexdima THIS IS WRONG */, true);
                    }
                }
                return undefined;
            },
            get all() {
                const result = [];
                for (const desc of extensionInfo.mine.getAllExtensionDescriptions()) {
                    result.push(new Extension(extensionService, extension.identifier, desc, extensionKind, false));
                }
                return result;
            },
            get allAcrossExtensionHosts() {
                checkProposedApiEnabled(extension, 'extensionsAny');
                const local = new ExtensionIdentifierSet(extensionInfo.mine.getAllExtensionDescriptions().map(desc => desc.identifier));
                const result = [];
                for (const desc of extensionInfo.all.getAllExtensionDescriptions()) {
                    const isFromDifferentExtensionHost = !local.has(desc.identifier);
                    result.push(new Extension(extensionService, extension.identifier, desc, extensionKind /* TODO@alexdima THIS IS WRONG */, isFromDifferentExtensionHost));
                }
                return result;
            },
            get onDidChange() {
                if (isProposedApiEnabled(extension, 'extensionsAny')) {
                    return _asExtensionEvent(Event.any(extensionInfo.mine.onDidChange, extensionInfo.all.onDidChange));
                }
                return _asExtensionEvent(extensionInfo.mine.onDidChange);
            }
        };
        // namespace: languages
        const languages = {
            createDiagnosticCollection(name) {
                return extHostDiagnostics.createDiagnosticCollection(extension.identifier, name);
            },
            get onDidChangeDiagnostics() {
                return _asExtensionEvent(extHostDiagnostics.onDidChangeDiagnostics);
            },
            getDiagnostics: (resource) => {
                return extHostDiagnostics.getDiagnostics(resource);
            },
            getLanguages() {
                return extHostLanguages.getLanguages();
            },
            setTextDocumentLanguage(document, languageId) {
                return extHostLanguages.changeLanguage(document.uri, languageId);
            },
            match(selector, document) {
                const interalSelector = typeConverters.LanguageSelector.from(selector);
                let notebook;
                if (targetsNotebooks(interalSelector)) {
                    notebook = extHostNotebook.notebookDocuments.find(value => value.apiNotebook.getCells().find(c => c.document === document))?.apiNotebook;
                }
                return score(interalSelector, document.uri, document.languageId, true, notebook?.uri, notebook?.notebookType);
            },
            registerCodeActionsProvider(selector, provider, metadata) {
                return extHostLanguageFeatures.registerCodeActionProvider(extension, checkSelector(selector), provider, metadata);
            },
            registerDocumentPasteEditProvider(selector, provider, metadata) {
                checkProposedApiEnabled(extension, 'documentPaste');
                return extHostLanguageFeatures.registerDocumentPasteEditProvider(extension, checkSelector(selector), provider, metadata);
            },
            registerCodeLensProvider(selector, provider) {
                return extHostLanguageFeatures.registerCodeLensProvider(extension, checkSelector(selector), provider);
            },
            registerDefinitionProvider(selector, provider) {
                return extHostLanguageFeatures.registerDefinitionProvider(extension, checkSelector(selector), provider);
            },
            registerDeclarationProvider(selector, provider) {
                return extHostLanguageFeatures.registerDeclarationProvider(extension, checkSelector(selector), provider);
            },
            registerImplementationProvider(selector, provider) {
                return extHostLanguageFeatures.registerImplementationProvider(extension, checkSelector(selector), provider);
            },
            registerTypeDefinitionProvider(selector, provider) {
                return extHostLanguageFeatures.registerTypeDefinitionProvider(extension, checkSelector(selector), provider);
            },
            registerHoverProvider(selector, provider) {
                return extHostLanguageFeatures.registerHoverProvider(extension, checkSelector(selector), provider, extension.identifier);
            },
            registerEvaluatableExpressionProvider(selector, provider) {
                return extHostLanguageFeatures.registerEvaluatableExpressionProvider(extension, checkSelector(selector), provider, extension.identifier);
            },
            registerInlineValuesProvider(selector, provider) {
                return extHostLanguageFeatures.registerInlineValuesProvider(extension, checkSelector(selector), provider, extension.identifier);
            },
            registerDocumentHighlightProvider(selector, provider) {
                return extHostLanguageFeatures.registerDocumentHighlightProvider(extension, checkSelector(selector), provider);
            },
            registerMultiDocumentHighlightProvider(selector, provider) {
                return extHostLanguageFeatures.registerMultiDocumentHighlightProvider(extension, checkSelector(selector), provider);
            },
            registerLinkedEditingRangeProvider(selector, provider) {
                return extHostLanguageFeatures.registerLinkedEditingRangeProvider(extension, checkSelector(selector), provider);
            },
            registerReferenceProvider(selector, provider) {
                return extHostLanguageFeatures.registerReferenceProvider(extension, checkSelector(selector), provider);
            },
            registerRenameProvider(selector, provider) {
                return extHostLanguageFeatures.registerRenameProvider(extension, checkSelector(selector), provider);
            },
            registerNewSymbolNamesProvider(selector, provider) {
                checkProposedApiEnabled(extension, 'newSymbolNamesProvider');
                return extHostLanguageFeatures.registerNewSymbolNamesProvider(extension, checkSelector(selector), provider);
            },
            registerDocumentSymbolProvider(selector, provider, metadata) {
                return extHostLanguageFeatures.registerDocumentSymbolProvider(extension, checkSelector(selector), provider, metadata);
            },
            registerWorkspaceSymbolProvider(provider) {
                return extHostLanguageFeatures.registerWorkspaceSymbolProvider(extension, provider);
            },
            registerDocumentFormattingEditProvider(selector, provider) {
                return extHostLanguageFeatures.registerDocumentFormattingEditProvider(extension, checkSelector(selector), provider);
            },
            registerDocumentRangeFormattingEditProvider(selector, provider) {
                return extHostLanguageFeatures.registerDocumentRangeFormattingEditProvider(extension, checkSelector(selector), provider);
            },
            registerOnTypeFormattingEditProvider(selector, provider, firstTriggerCharacter, ...moreTriggerCharacters) {
                return extHostLanguageFeatures.registerOnTypeFormattingEditProvider(extension, checkSelector(selector), provider, [firstTriggerCharacter].concat(moreTriggerCharacters));
            },
            registerDocumentSemanticTokensProvider(selector, provider, legend) {
                return extHostLanguageFeatures.registerDocumentSemanticTokensProvider(extension, checkSelector(selector), provider, legend);
            },
            registerDocumentRangeSemanticTokensProvider(selector, provider, legend) {
                return extHostLanguageFeatures.registerDocumentRangeSemanticTokensProvider(extension, checkSelector(selector), provider, legend);
            },
            registerSignatureHelpProvider(selector, provider, firstItem, ...remaining) {
                if (typeof firstItem === 'object') {
                    return extHostLanguageFeatures.registerSignatureHelpProvider(extension, checkSelector(selector), provider, firstItem);
                }
                return extHostLanguageFeatures.registerSignatureHelpProvider(extension, checkSelector(selector), provider, typeof firstItem === 'undefined' ? [] : [firstItem, ...remaining]);
            },
            registerCompletionItemProvider(selector, provider, ...triggerCharacters) {
                return extHostLanguageFeatures.registerCompletionItemProvider(extension, checkSelector(selector), provider, triggerCharacters);
            },
            registerInlineCompletionItemProvider(selector, provider, metadata) {
                if (provider.handleDidShowCompletionItem) {
                    checkProposedApiEnabled(extension, 'inlineCompletionsAdditions');
                }
                if (provider.handleDidPartiallyAcceptCompletionItem) {
                    checkProposedApiEnabled(extension, 'inlineCompletionsAdditions');
                }
                if (metadata) {
                    checkProposedApiEnabled(extension, 'inlineCompletionsAdditions');
                }
                return extHostLanguageFeatures.registerInlineCompletionsProvider(extension, checkSelector(selector), provider, metadata);
            },
            registerInlineEditProvider(selector, provider) {
                checkProposedApiEnabled(extension, 'inlineEdit');
                return extHostLanguageFeatures.registerInlineEditProvider(extension, checkSelector(selector), provider);
            },
            registerDocumentLinkProvider(selector, provider) {
                return extHostLanguageFeatures.registerDocumentLinkProvider(extension, checkSelector(selector), provider);
            },
            registerColorProvider(selector, provider) {
                return extHostLanguageFeatures.registerColorProvider(extension, checkSelector(selector), provider);
            },
            registerFoldingRangeProvider(selector, provider) {
                return extHostLanguageFeatures.registerFoldingRangeProvider(extension, checkSelector(selector), provider);
            },
            registerSelectionRangeProvider(selector, provider) {
                return extHostLanguageFeatures.registerSelectionRangeProvider(extension, selector, provider);
            },
            registerCallHierarchyProvider(selector, provider) {
                return extHostLanguageFeatures.registerCallHierarchyProvider(extension, selector, provider);
            },
            registerTypeHierarchyProvider(selector, provider) {
                return extHostLanguageFeatures.registerTypeHierarchyProvider(extension, selector, provider);
            },
            setLanguageConfiguration: (language, configuration) => {
                return extHostLanguageFeatures.setLanguageConfiguration(extension, language, configuration);
            },
            getTokenInformationAtPosition(doc, pos) {
                checkProposedApiEnabled(extension, 'tokenInformation');
                return extHostLanguages.tokenAtPosition(doc, pos);
            },
            registerInlayHintsProvider(selector, provider) {
                return extHostLanguageFeatures.registerInlayHintsProvider(extension, selector, provider);
            },
            createLanguageStatusItem(id, selector) {
                return extHostLanguages.createLanguageStatusItem(extension, id, selector);
            },
            registerDocumentDropEditProvider(selector, provider, metadata) {
                return extHostLanguageFeatures.registerDocumentOnDropEditProvider(extension, selector, provider, isProposedApiEnabled(extension, 'documentPaste') ? metadata : undefined);
            }
        };
        // namespace: window
        const window = {
            get activeTextEditor() {
                return extHostEditors.getActiveTextEditor();
            },
            get visibleTextEditors() {
                return extHostEditors.getVisibleTextEditors();
            },
            get activeTerminal() {
                return extHostTerminalService.activeTerminal;
            },
            get terminals() {
                return extHostTerminalService.terminals;
            },
            async showTextDocument(documentOrUri, columnOrOptions, preserveFocus) {
                if (URI.isUri(documentOrUri) && documentOrUri.scheme === Schemas.vscodeRemote && !documentOrUri.authority) {
                    extHostApiDeprecation.report('workspace.showTextDocument', extension, `A URI of 'vscode-remote' scheme requires an authority.`);
                }
                const document = await (URI.isUri(documentOrUri)
                    ? Promise.resolve(workspace.openTextDocument(documentOrUri))
                    : Promise.resolve(documentOrUri));
                return extHostEditors.showTextDocument(document, columnOrOptions, preserveFocus);
            },
            createTextEditorDecorationType(options) {
                return extHostEditors.createTextEditorDecorationType(extension, options);
            },
            onDidChangeActiveTextEditor(listener, thisArg, disposables) {
                return _asExtensionEvent(extHostEditors.onDidChangeActiveTextEditor)(listener, thisArg, disposables);
            },
            onDidChangeVisibleTextEditors(listener, thisArg, disposables) {
                return _asExtensionEvent(extHostEditors.onDidChangeVisibleTextEditors)(listener, thisArg, disposables);
            },
            onDidChangeTextEditorSelection(listener, thisArgs, disposables) {
                return _asExtensionEvent(extHostEditors.onDidChangeTextEditorSelection)(listener, thisArgs, disposables);
            },
            onDidChangeTextEditorOptions(listener, thisArgs, disposables) {
                return _asExtensionEvent(extHostEditors.onDidChangeTextEditorOptions)(listener, thisArgs, disposables);
            },
            onDidChangeTextEditorVisibleRanges(listener, thisArgs, disposables) {
                return _asExtensionEvent(extHostEditors.onDidChangeTextEditorVisibleRanges)(listener, thisArgs, disposables);
            },
            onDidChangeTextEditorViewColumn(listener, thisArg, disposables) {
                return _asExtensionEvent(extHostEditors.onDidChangeTextEditorViewColumn)(listener, thisArg, disposables);
            },
            onDidCloseTerminal(listener, thisArg, disposables) {
                return _asExtensionEvent(extHostTerminalService.onDidCloseTerminal)(listener, thisArg, disposables);
            },
            onDidOpenTerminal(listener, thisArg, disposables) {
                return _asExtensionEvent(extHostTerminalService.onDidOpenTerminal)(listener, thisArg, disposables);
            },
            onDidChangeActiveTerminal(listener, thisArg, disposables) {
                return _asExtensionEvent(extHostTerminalService.onDidChangeActiveTerminal)(listener, thisArg, disposables);
            },
            onDidChangeTerminalDimensions(listener, thisArg, disposables) {
                checkProposedApiEnabled(extension, 'terminalDimensions');
                return _asExtensionEvent(extHostTerminalService.onDidChangeTerminalDimensions)(listener, thisArg, disposables);
            },
            onDidChangeTerminalState(listener, thisArg, disposables) {
                return _asExtensionEvent(extHostTerminalService.onDidChangeTerminalState)(listener, thisArg, disposables);
            },
            onDidWriteTerminalData(listener, thisArg, disposables) {
                checkProposedApiEnabled(extension, 'terminalDataWriteEvent');
                return _asExtensionEvent(extHostTerminalService.onDidWriteTerminalData)(listener, thisArg, disposables);
            },
            onDidExecuteTerminalCommand(listener, thisArg, disposables) {
                checkProposedApiEnabled(extension, 'terminalExecuteCommandEvent');
                return _asExtensionEvent(extHostTerminalService.onDidExecuteTerminalCommand)(listener, thisArg, disposables);
            },
            onDidChangeTerminalShellIntegration(listener, thisArg, disposables) {
                return _asExtensionEvent(extHostTerminalShellIntegration.onDidChangeTerminalShellIntegration)(listener, thisArg, disposables);
            },
            onDidStartTerminalShellExecution(listener, thisArg, disposables) {
                return _asExtensionEvent(extHostTerminalShellIntegration.onDidStartTerminalShellExecution)(listener, thisArg, disposables);
            },
            onDidEndTerminalShellExecution(listener, thisArg, disposables) {
                return _asExtensionEvent(extHostTerminalShellIntegration.onDidEndTerminalShellExecution)(listener, thisArg, disposables);
            },
            get state() {
                return extHostWindow.getState();
            },
            onDidChangeWindowState(listener, thisArg, disposables) {
                return _asExtensionEvent(extHostWindow.onDidChangeWindowState)(listener, thisArg, disposables);
            },
            showInformationMessage(message, ...rest) {
                return extHostMessageService.showMessage(extension, Severity.Info, message, rest[0], rest.slice(1));
            },
            showWarningMessage(message, ...rest) {
                return extHostMessageService.showMessage(extension, Severity.Warning, message, rest[0], rest.slice(1));
            },
            showErrorMessage(message, ...rest) {
                return extHostMessageService.showMessage(extension, Severity.Error, message, rest[0], rest.slice(1));
            },
            showQuickPick(items, options, token) {
                return extHostQuickOpen.showQuickPick(extension, items, options, token);
            },
            showWorkspaceFolderPick(options) {
                return extHostQuickOpen.showWorkspaceFolderPick(options);
            },
            showInputBox(options, token) {
                return extHostQuickOpen.showInput(options, token);
            },
            showOpenDialog(options) {
                return extHostDialogs.showOpenDialog(extension, options);
            },
            showSaveDialog(options) {
                return extHostDialogs.showSaveDialog(options);
            },
            createStatusBarItem(alignmentOrId, priorityOrAlignment, priorityArg) {
                let id;
                let alignment;
                let priority;
                if (typeof alignmentOrId === 'string') {
                    id = alignmentOrId;
                    alignment = priorityOrAlignment;
                    priority = priorityArg;
                }
                else {
                    alignment = alignmentOrId;
                    priority = priorityOrAlignment;
                }
                return extHostStatusBar.createStatusBarEntry(extension, id, alignment, priority);
            },
            setStatusBarMessage(text, timeoutOrThenable) {
                return extHostStatusBar.setStatusBarMessage(text, timeoutOrThenable);
            },
            withScmProgress(task) {
                extHostApiDeprecation.report('window.withScmProgress', extension, `Use 'withProgress' instead.`);
                return extHostProgress.withProgress(extension, { location: extHostTypes.ProgressLocation.SourceControl }, (progress, token) => task({ report(n) { } }));
            },
            withProgress(options, task) {
                return extHostProgress.withProgress(extension, options, task);
            },
            createOutputChannel(name, options) {
                return extHostOutputService.createOutputChannel(name, options, extension);
            },
            createWebviewPanel(viewType, title, showOptions, options) {
                return extHostWebviewPanels.createWebviewPanel(extension, viewType, title, showOptions, options);
            },
            createWebviewTextEditorInset(editor, line, height, options) {
                checkProposedApiEnabled(extension, 'editorInsets');
                return extHostEditorInsets.createWebviewEditorInset(editor, line, height, options, extension);
            },
            createTerminal(nameOrOptions, shellPath, shellArgs) {
                if (typeof nameOrOptions === 'object') {
                    if ('pty' in nameOrOptions) {
                        return extHostTerminalService.createExtensionTerminal(nameOrOptions);
                    }
                    return extHostTerminalService.createTerminalFromOptions(nameOrOptions);
                }
                return extHostTerminalService.createTerminal(nameOrOptions, shellPath, shellArgs);
            },
            registerTerminalLinkProvider(provider) {
                return extHostTerminalService.registerLinkProvider(provider);
            },
            registerTerminalProfileProvider(id, provider) {
                return extHostTerminalService.registerProfileProvider(extension, id, provider);
            },
            registerTerminalQuickFixProvider(id, provider) {
                checkProposedApiEnabled(extension, 'terminalQuickFixProvider');
                return extHostTerminalService.registerTerminalQuickFixProvider(id, extension.identifier.value, provider);
            },
            registerTreeDataProvider(viewId, treeDataProvider) {
                return extHostTreeViews.registerTreeDataProvider(viewId, treeDataProvider, extension);
            },
            createTreeView(viewId, options) {
                return extHostTreeViews.createTreeView(viewId, options, extension);
            },
            registerWebviewPanelSerializer: (viewType, serializer) => {
                return extHostWebviewPanels.registerWebviewPanelSerializer(extension, viewType, serializer);
            },
            registerCustomEditorProvider: (viewType, provider, options = {}) => {
                return extHostCustomEditors.registerCustomEditorProvider(extension, viewType, provider, options);
            },
            registerFileDecorationProvider(provider) {
                return extHostDecorations.registerFileDecorationProvider(provider, extension);
            },
            registerUriHandler(handler) {
                return extHostUrls.registerUriHandler(extension, handler);
            },
            createQuickPick() {
                return extHostQuickOpen.createQuickPick(extension);
            },
            createInputBox() {
                return extHostQuickOpen.createInputBox(extension);
            },
            get activeColorTheme() {
                return extHostTheming.activeColorTheme;
            },
            onDidChangeActiveColorTheme(listener, thisArg, disposables) {
                return _asExtensionEvent(extHostTheming.onDidChangeActiveColorTheme)(listener, thisArg, disposables);
            },
            registerWebviewViewProvider(viewId, provider, options) {
                return extHostWebviewViews.registerWebviewViewProvider(extension, viewId, provider, options?.webviewOptions);
            },
            get activeNotebookEditor() {
                return extHostNotebook.activeNotebookEditor;
            },
            onDidChangeActiveNotebookEditor(listener, thisArgs, disposables) {
                return _asExtensionEvent(extHostNotebook.onDidChangeActiveNotebookEditor)(listener, thisArgs, disposables);
            },
            get visibleNotebookEditors() {
                return extHostNotebook.visibleNotebookEditors;
            },
            get onDidChangeVisibleNotebookEditors() {
                return _asExtensionEvent(extHostNotebook.onDidChangeVisibleNotebookEditors);
            },
            onDidChangeNotebookEditorSelection(listener, thisArgs, disposables) {
                return _asExtensionEvent(extHostNotebookEditors.onDidChangeNotebookEditorSelection)(listener, thisArgs, disposables);
            },
            onDidChangeNotebookEditorVisibleRanges(listener, thisArgs, disposables) {
                return _asExtensionEvent(extHostNotebookEditors.onDidChangeNotebookEditorVisibleRanges)(listener, thisArgs, disposables);
            },
            showNotebookDocument(document, options) {
                return extHostNotebook.showNotebookDocument(document, options);
            },
            registerExternalUriOpener(id, opener, metadata) {
                checkProposedApiEnabled(extension, 'externalUriOpener');
                return extHostUriOpeners.registerExternalUriOpener(extension.identifier, id, opener, metadata);
            },
            registerProfileContentHandler(id, handler) {
                checkProposedApiEnabled(extension, 'profileContentHandlers');
                return extHostProfileContentHandlers.registerProfileContentHandler(extension, id, handler);
            },
            registerQuickDiffProvider(selector, quickDiffProvider, label, rootUri) {
                checkProposedApiEnabled(extension, 'quickDiffProvider');
                return extHostQuickDiff.registerQuickDiffProvider(checkSelector(selector), quickDiffProvider, label, rootUri);
            },
            get tabGroups() {
                return extHostEditorTabs.tabGroups;
            },
            registerShareProvider(selector, provider) {
                checkProposedApiEnabled(extension, 'shareProvider');
                return extHostShare.registerShareProvider(checkSelector(selector), provider);
            }
        };
        // namespace: workspace
        const workspace = {
            get rootPath() {
                extHostApiDeprecation.report('workspace.rootPath', extension, `Please use 'workspace.workspaceFolders' instead. More details: https://aka.ms/vscode-eliminating-rootpath`);
                return extHostWorkspace.getPath();
            },
            set rootPath(value) {
                throw new errors.ReadonlyError('rootPath');
            },
            getWorkspaceFolder(resource) {
                return extHostWorkspace.getWorkspaceFolder(resource);
            },
            get workspaceFolders() {
                return extHostWorkspace.getWorkspaceFolders();
            },
            get name() {
                return extHostWorkspace.name;
            },
            set name(value) {
                throw new errors.ReadonlyError('name');
            },
            get workspaceFile() {
                return extHostWorkspace.workspaceFile;
            },
            set workspaceFile(value) {
                throw new errors.ReadonlyError('workspaceFile');
            },
            updateWorkspaceFolders: (index, deleteCount, ...workspaceFoldersToAdd) => {
                return extHostWorkspace.updateWorkspaceFolders(extension, index, deleteCount || 0, ...workspaceFoldersToAdd);
            },
            onDidChangeWorkspaceFolders: function (listener, thisArgs, disposables) {
                return _asExtensionEvent(extHostWorkspace.onDidChangeWorkspace)(listener, thisArgs, disposables);
            },
            asRelativePath: (pathOrUri, includeWorkspace) => {
                return extHostWorkspace.getRelativePath(pathOrUri, includeWorkspace);
            },
            findFiles: (include, exclude, maxResults, token) => {
                // Note, undefined/null have different meanings on "exclude"
                return extHostWorkspace.findFiles(include, exclude, maxResults, extension.identifier, token);
            },
            findFiles2: (filePattern, options, token) => {
                checkProposedApiEnabled(extension, 'findFiles2');
                return extHostWorkspace.findFiles2(filePattern, options, extension.identifier, token);
            },
            findFiles2New: (filePattern, options, token) => {
                checkProposedApiEnabled(extension, 'findFiles2New');
                return extHostWorkspace.findFiles2New(filePattern, options, extension.identifier, token);
            },
            findTextInFiles: (query, optionsOrCallback, callbackOrToken, token) => {
                checkProposedApiEnabled(extension, 'findTextInFiles');
                let options;
                let callback;
                if (typeof optionsOrCallback === 'object') {
                    options = optionsOrCallback;
                    callback = callbackOrToken;
                }
                else {
                    options = {};
                    callback = optionsOrCallback;
                    token = callbackOrToken;
                }
                return extHostWorkspace.findTextInFiles(query, options || {}, callback, extension.identifier, token);
            },
            findTextInFilesNew: (query, options, token) => {
                checkProposedApiEnabled(extension, 'findTextInFilesNew');
                checkProposedApiEnabled(extension, 'textSearchProviderNew');
                return extHostWorkspace.findTextInFilesNew(query, options, extension.identifier, token);
            },
            save: (uri) => {
                return extHostWorkspace.save(uri);
            },
            saveAs: (uri) => {
                return extHostWorkspace.saveAs(uri);
            },
            saveAll: (includeUntitled) => {
                return extHostWorkspace.saveAll(includeUntitled);
            },
            applyEdit(edit, metadata) {
                return extHostBulkEdits.applyWorkspaceEdit(edit, extension, metadata);
            },
            createFileSystemWatcher: (pattern, optionsOrIgnoreCreate, ignoreChange, ignoreDelete) => {
                let options = undefined;
                if (optionsOrIgnoreCreate && typeof optionsOrIgnoreCreate !== 'boolean') {
                    checkProposedApiEnabled(extension, 'createFileSystemWatcher');
                    options = {
                        ...optionsOrIgnoreCreate,
                        correlate: true
                    };
                }
                else {
                    options = {
                        ignoreCreateEvents: Boolean(optionsOrIgnoreCreate),
                        ignoreChangeEvents: Boolean(ignoreChange),
                        ignoreDeleteEvents: Boolean(ignoreDelete),
                        correlate: false
                    };
                }
                return extHostFileSystemEvent.createFileSystemWatcher(extHostWorkspace, configProvider, extension, pattern, options);
            },
            get textDocuments() {
                return extHostDocuments.getAllDocumentData().map(data => data.document);
            },
            set textDocuments(value) {
                throw new errors.ReadonlyError('textDocuments');
            },
            openTextDocument(uriOrFileNameOrOptions) {
                let uriPromise;
                const options = uriOrFileNameOrOptions;
                if (typeof uriOrFileNameOrOptions === 'string') {
                    uriPromise = Promise.resolve(URI.file(uriOrFileNameOrOptions));
                }
                else if (URI.isUri(uriOrFileNameOrOptions)) {
                    uriPromise = Promise.resolve(uriOrFileNameOrOptions);
                }
                else if (!options || typeof options === 'object') {
                    uriPromise = extHostDocuments.createDocumentData(options);
                }
                else {
                    throw new Error('illegal argument - uriOrFileNameOrOptions');
                }
                return uriPromise.then(uri => {
                    extHostLogService.trace(`openTextDocument from ${extension.identifier}`);
                    if (uri.scheme === Schemas.vscodeRemote && !uri.authority) {
                        extHostApiDeprecation.report('workspace.openTextDocument', extension, `A URI of 'vscode-remote' scheme requires an authority.`);
                    }
                    return extHostDocuments.ensureDocumentData(uri).then(documentData => {
                        return documentData.document;
                    });
                });
            },
            onDidOpenTextDocument: (listener, thisArgs, disposables) => {
                return _asExtensionEvent(extHostDocuments.onDidAddDocument)(listener, thisArgs, disposables);
            },
            onDidCloseTextDocument: (listener, thisArgs, disposables) => {
                return _asExtensionEvent(extHostDocuments.onDidRemoveDocument)(listener, thisArgs, disposables);
            },
            onDidChangeTextDocument: (listener, thisArgs, disposables) => {
                return _asExtensionEvent(extHostDocuments.onDidChangeDocument)(listener, thisArgs, disposables);
            },
            onDidSaveTextDocument: (listener, thisArgs, disposables) => {
                return _asExtensionEvent(extHostDocuments.onDidSaveDocument)(listener, thisArgs, disposables);
            },
            onWillSaveTextDocument: (listener, thisArgs, disposables) => {
                return _asExtensionEvent(extHostDocumentSaveParticipant.getOnWillSaveTextDocumentEvent(extension))(listener, thisArgs, disposables);
            },
            get notebookDocuments() {
                return extHostNotebook.notebookDocuments.map(d => d.apiNotebook);
            },
            async openNotebookDocument(uriOrType, content) {
                let uri;
                if (URI.isUri(uriOrType)) {
                    uri = uriOrType;
                    await extHostNotebook.openNotebookDocument(uriOrType);
                }
                else if (typeof uriOrType === 'string') {
                    uri = URI.revive(await extHostNotebook.createNotebookDocument({ viewType: uriOrType, content }));
                }
                else {
                    throw new Error('Invalid arguments');
                }
                return extHostNotebook.getNotebookDocument(uri).apiNotebook;
            },
            onDidSaveNotebookDocument(listener, thisArg, disposables) {
                return _asExtensionEvent(extHostNotebookDocuments.onDidSaveNotebookDocument)(listener, thisArg, disposables);
            },
            onDidChangeNotebookDocument(listener, thisArg, disposables) {
                return _asExtensionEvent(extHostNotebookDocuments.onDidChangeNotebookDocument)(listener, thisArg, disposables);
            },
            onWillSaveNotebookDocument(listener, thisArg, disposables) {
                return _asExtensionEvent(extHostNotebookDocumentSaveParticipant.getOnWillSaveNotebookDocumentEvent(extension))(listener, thisArg, disposables);
            },
            get onDidOpenNotebookDocument() {
                return _asExtensionEvent(extHostNotebook.onDidOpenNotebookDocument);
            },
            get onDidCloseNotebookDocument() {
                return _asExtensionEvent(extHostNotebook.onDidCloseNotebookDocument);
            },
            registerNotebookSerializer(viewType, serializer, options, registration) {
                return extHostNotebook.registerNotebookSerializer(extension, viewType, serializer, options, isProposedApiEnabled(extension, 'notebookLiveShare') ? registration : undefined);
            },
            onDidChangeConfiguration: (listener, thisArgs, disposables) => {
                return _asExtensionEvent(configProvider.onDidChangeConfiguration)(listener, thisArgs, disposables);
            },
            getConfiguration(section, scope) {
                scope = arguments.length === 1 ? undefined : scope;
                return configProvider.getConfiguration(section, scope, extension);
            },
            registerTextDocumentContentProvider(scheme, provider) {
                return extHostDocumentContentProviders.registerTextDocumentContentProvider(scheme, provider);
            },
            registerTaskProvider: (type, provider) => {
                extHostApiDeprecation.report('window.registerTaskProvider', extension, `Use the corresponding function on the 'tasks' namespace instead`);
                return extHostTask.registerTaskProvider(extension, type, provider);
            },
            registerFileSystemProvider(scheme, provider, options) {
                return combinedDisposable(extHostFileSystem.registerFileSystemProvider(extension, scheme, provider, options), extHostConsumerFileSystem.addFileSystemProvider(scheme, provider, options));
            },
            get fs() {
                return extHostConsumerFileSystem.value;
            },
            registerFileSearchProvider: (scheme, provider) => {
                checkProposedApiEnabled(extension, 'fileSearchProvider');
                return extHostSearch.registerFileSearchProviderOld(scheme, provider);
            },
            registerTextSearchProvider: (scheme, provider) => {
                checkProposedApiEnabled(extension, 'textSearchProvider');
                return extHostSearch.registerTextSearchProviderOld(scheme, provider);
            },
            registerAITextSearchProvider: (scheme, provider) => {
                // there are some dependencies on textSearchProvider, so we need to check for both
                checkProposedApiEnabled(extension, 'aiTextSearchProvider');
                checkProposedApiEnabled(extension, 'textSearchProvider');
                return extHostSearch.registerAITextSearchProviderOld(scheme, provider);
            },
            registerFileSearchProviderNew: (scheme, provider) => {
                checkProposedApiEnabled(extension, 'fileSearchProviderNew');
                return extHostSearch.registerFileSearchProvider(scheme, provider);
            },
            registerTextSearchProviderNew: (scheme, provider) => {
                checkProposedApiEnabled(extension, 'textSearchProviderNew');
                return extHostSearch.registerTextSearchProvider(scheme, provider);
            },
            registerAITextSearchProviderNew: (scheme, provider) => {
                // there are some dependencies on textSearchProvider, so we need to check for both
                checkProposedApiEnabled(extension, 'aiTextSearchProviderNew');
                checkProposedApiEnabled(extension, 'textSearchProviderNew');
                return extHostSearch.registerAITextSearchProvider(scheme, provider);
            },
            registerRemoteAuthorityResolver: (authorityPrefix, resolver) => {
                checkProposedApiEnabled(extension, 'resolvers');
                return extensionService.registerRemoteAuthorityResolver(authorityPrefix, resolver);
            },
            registerResourceLabelFormatter: (formatter) => {
                checkProposedApiEnabled(extension, 'resolvers');
                return extHostLabelService.$registerResourceLabelFormatter(formatter);
            },
            getRemoteExecServer: (authority) => {
                checkProposedApiEnabled(extension, 'resolvers');
                return extensionService.getRemoteExecServer(authority);
            },
            onDidCreateFiles: (listener, thisArg, disposables) => {
                return _asExtensionEvent(extHostFileSystemEvent.onDidCreateFile)(listener, thisArg, disposables);
            },
            onDidDeleteFiles: (listener, thisArg, disposables) => {
                return _asExtensionEvent(extHostFileSystemEvent.onDidDeleteFile)(listener, thisArg, disposables);
            },
            onDidRenameFiles: (listener, thisArg, disposables) => {
                return _asExtensionEvent(extHostFileSystemEvent.onDidRenameFile)(listener, thisArg, disposables);
            },
            onWillCreateFiles: (listener, thisArg, disposables) => {
                return _asExtensionEvent(extHostFileSystemEvent.getOnWillCreateFileEvent(extension))(listener, thisArg, disposables);
            },
            onWillDeleteFiles: (listener, thisArg, disposables) => {
                return _asExtensionEvent(extHostFileSystemEvent.getOnWillDeleteFileEvent(extension))(listener, thisArg, disposables);
            },
            onWillRenameFiles: (listener, thisArg, disposables) => {
                return _asExtensionEvent(extHostFileSystemEvent.getOnWillRenameFileEvent(extension))(listener, thisArg, disposables);
            },
            openTunnel: (forward) => {
                checkProposedApiEnabled(extension, 'tunnels');
                return extHostTunnelService.openTunnel(extension, forward).then(value => {
                    if (!value) {
                        throw new Error('cannot open tunnel');
                    }
                    return value;
                });
            },
            get tunnels() {
                checkProposedApiEnabled(extension, 'tunnels');
                return extHostTunnelService.getTunnels();
            },
            onDidChangeTunnels: (listener, thisArg, disposables) => {
                checkProposedApiEnabled(extension, 'tunnels');
                return _asExtensionEvent(extHostTunnelService.onDidChangeTunnels)(listener, thisArg, disposables);
            },
            registerPortAttributesProvider: (portSelector, provider) => {
                checkProposedApiEnabled(extension, 'portsAttributes');
                return extHostTunnelService.registerPortsAttributesProvider(portSelector, provider);
            },
            registerTunnelProvider: (tunnelProvider, information) => {
                checkProposedApiEnabled(extension, 'tunnelFactory');
                return extHostTunnelService.registerTunnelProvider(tunnelProvider, information);
            },
            registerTimelineProvider: (scheme, provider) => {
                checkProposedApiEnabled(extension, 'timeline');
                return extHostTimeline.registerTimelineProvider(scheme, provider, extension.identifier, extHostCommands.converter);
            },
            get isTrusted() {
                return extHostWorkspace.trusted;
            },
            requestWorkspaceTrust: (options) => {
                checkProposedApiEnabled(extension, 'workspaceTrust');
                return extHostWorkspace.requestWorkspaceTrust(options);
            },
            onDidGrantWorkspaceTrust: (listener, thisArgs, disposables) => {
                return _asExtensionEvent(extHostWorkspace.onDidGrantWorkspaceTrust)(listener, thisArgs, disposables);
            },
            registerEditSessionIdentityProvider: (scheme, provider) => {
                checkProposedApiEnabled(extension, 'editSessionIdentityProvider');
                return extHostWorkspace.registerEditSessionIdentityProvider(scheme, provider);
            },
            onWillCreateEditSessionIdentity: (listener, thisArgs, disposables) => {
                checkProposedApiEnabled(extension, 'editSessionIdentityProvider');
                return _asExtensionEvent(extHostWorkspace.getOnWillCreateEditSessionIdentityEvent(extension))(listener, thisArgs, disposables);
            },
            registerCanonicalUriProvider: (scheme, provider) => {
                checkProposedApiEnabled(extension, 'canonicalUriProvider');
                return extHostWorkspace.registerCanonicalUriProvider(scheme, provider);
            },
            getCanonicalUri: (uri, options, token) => {
                checkProposedApiEnabled(extension, 'canonicalUriProvider');
                return extHostWorkspace.provideCanonicalUri(uri, options, token);
            }
        };
        // namespace: scm
        const scm = {
            get inputBox() {
                extHostApiDeprecation.report('scm.inputBox', extension, `Use 'SourceControl.inputBox' instead`);
                return extHostSCM.getLastInputBox(extension); // Strict null override - Deprecated api
            },
            createSourceControl(id, label, rootUri) {
                return extHostSCM.createSourceControl(extension, id, label, rootUri);
            }
        };
        // namespace: comments
        const comments = {
            createCommentController(id, label) {
                return extHostComment.createCommentController(extension, id, label);
            }
        };
        // namespace: debug
        const debug = {
            get activeDebugSession() {
                return extHostDebugService.activeDebugSession;
            },
            get activeDebugConsole() {
                return extHostDebugService.activeDebugConsole;
            },
            get breakpoints() {
                return extHostDebugService.breakpoints;
            },
            get activeStackItem() {
                return extHostDebugService.activeStackItem;
            },
            registerDebugVisualizationProvider(id, provider) {
                checkProposedApiEnabled(extension, 'debugVisualization');
                return extHostDebugService.registerDebugVisualizationProvider(extension, id, provider);
            },
            registerDebugVisualizationTreeProvider(id, provider) {
                checkProposedApiEnabled(extension, 'debugVisualization');
                return extHostDebugService.registerDebugVisualizationTree(extension, id, provider);
            },
            onDidStartDebugSession(listener, thisArg, disposables) {
                return _asExtensionEvent(extHostDebugService.onDidStartDebugSession)(listener, thisArg, disposables);
            },
            onDidTerminateDebugSession(listener, thisArg, disposables) {
                return _asExtensionEvent(extHostDebugService.onDidTerminateDebugSession)(listener, thisArg, disposables);
            },
            onDidChangeActiveDebugSession(listener, thisArg, disposables) {
                return _asExtensionEvent(extHostDebugService.onDidChangeActiveDebugSession)(listener, thisArg, disposables);
            },
            onDidReceiveDebugSessionCustomEvent(listener, thisArg, disposables) {
                return _asExtensionEvent(extHostDebugService.onDidReceiveDebugSessionCustomEvent)(listener, thisArg, disposables);
            },
            onDidChangeBreakpoints(listener, thisArgs, disposables) {
                return _asExtensionEvent(extHostDebugService.onDidChangeBreakpoints)(listener, thisArgs, disposables);
            },
            onDidChangeActiveStackItem(listener, thisArg, disposables) {
                return _asExtensionEvent(extHostDebugService.onDidChangeActiveStackItem)(listener, thisArg, disposables);
            },
            registerDebugConfigurationProvider(debugType, provider, triggerKind) {
                return extHostDebugService.registerDebugConfigurationProvider(debugType, provider, triggerKind || DebugConfigurationProviderTriggerKind.Initial);
            },
            registerDebugAdapterDescriptorFactory(debugType, factory) {
                return extHostDebugService.registerDebugAdapterDescriptorFactory(extension, debugType, factory);
            },
            registerDebugAdapterTrackerFactory(debugType, factory) {
                return extHostDebugService.registerDebugAdapterTrackerFactory(debugType, factory);
            },
            startDebugging(folder, nameOrConfig, parentSessionOrOptions) {
                if (!parentSessionOrOptions || (typeof parentSessionOrOptions === 'object' && 'configuration' in parentSessionOrOptions)) {
                    return extHostDebugService.startDebugging(folder, nameOrConfig, { parentSession: parentSessionOrOptions });
                }
                return extHostDebugService.startDebugging(folder, nameOrConfig, parentSessionOrOptions || {});
            },
            stopDebugging(session) {
                return extHostDebugService.stopDebugging(session);
            },
            addBreakpoints(breakpoints) {
                return extHostDebugService.addBreakpoints(breakpoints);
            },
            removeBreakpoints(breakpoints) {
                return extHostDebugService.removeBreakpoints(breakpoints);
            },
            asDebugSourceUri(source, session) {
                return extHostDebugService.asDebugSourceUri(source, session);
            }
        };
        const tasks = {
            registerTaskProvider: (type, provider) => {
                return extHostTask.registerTaskProvider(extension, type, provider);
            },
            fetchTasks: (filter) => {
                return extHostTask.fetchTasks(filter);
            },
            executeTask: (task) => {
                return extHostTask.executeTask(extension, task);
            },
            get taskExecutions() {
                return extHostTask.taskExecutions;
            },
            onDidStartTask: (listeners, thisArgs, disposables) => {
                return _asExtensionEvent(extHostTask.onDidStartTask)(listeners, thisArgs, disposables);
            },
            onDidEndTask: (listeners, thisArgs, disposables) => {
                return _asExtensionEvent(extHostTask.onDidEndTask)(listeners, thisArgs, disposables);
            },
            onDidStartTaskProcess: (listeners, thisArgs, disposables) => {
                return _asExtensionEvent(extHostTask.onDidStartTaskProcess)(listeners, thisArgs, disposables);
            },
            onDidEndTaskProcess: (listeners, thisArgs, disposables) => {
                return _asExtensionEvent(extHostTask.onDidEndTaskProcess)(listeners, thisArgs, disposables);
            }
        };
        // namespace: notebook
        const notebooks = {
            createNotebookController(id, notebookType, label, handler, rendererScripts) {
                return extHostNotebookKernels.createNotebookController(extension, id, notebookType, label, handler, isProposedApiEnabled(extension, 'notebookMessaging') ? rendererScripts : undefined);
            },
            registerNotebookCellStatusBarItemProvider: (notebookType, provider) => {
                return extHostNotebook.registerNotebookCellStatusBarItemProvider(extension, notebookType, provider);
            },
            createRendererMessaging(rendererId) {
                return extHostNotebookRenderers.createRendererMessaging(extension, rendererId);
            },
            createNotebookControllerDetectionTask(notebookType) {
                checkProposedApiEnabled(extension, 'notebookKernelSource');
                return extHostNotebookKernels.createNotebookControllerDetectionTask(extension, notebookType);
            },
            registerKernelSourceActionProvider(notebookType, provider) {
                checkProposedApiEnabled(extension, 'notebookKernelSource');
                return extHostNotebookKernels.registerKernelSourceActionProvider(extension, notebookType, provider);
            },
            onDidChangeNotebookCellExecutionState(listener, thisArgs, disposables) {
                checkProposedApiEnabled(extension, 'notebookCellExecutionState');
                return _asExtensionEvent(extHostNotebookKernels.onDidChangeNotebookCellExecutionState)(listener, thisArgs, disposables);
            }
        };
        // namespace: l10n
        const l10n = {
            t(...params) {
                if (typeof params[0] === 'string') {
                    const key = params.shift();
                    // We have either rest args which are Array<string | number | boolean> or an array with a single Record<string, any>.
                    // This ensures we get a Record<string | number, any> which will be formatted correctly.
                    const argsFormatted = !params || typeof params[0] !== 'object' ? params : params[0];
                    return extHostLocalization.getMessage(extension.identifier.value, { message: key, args: argsFormatted });
                }
                return extHostLocalization.getMessage(extension.identifier.value, params[0]);
            },
            get bundle() {
                return extHostLocalization.getBundle(extension.identifier.value);
            },
            get uri() {
                return extHostLocalization.getBundleUri(extension.identifier.value);
            }
        };
        // namespace: interactive
        const interactive = {
            transferActiveChat(toWorkspace) {
                checkProposedApiEnabled(extension, 'interactive');
                return extHostChatAgents2.transferActiveChat(toWorkspace);
            }
        };
        // namespace: ai
        const ai = {
            getRelatedInformation(query, types) {
                checkProposedApiEnabled(extension, 'aiRelatedInformation');
                return extHostAiRelatedInformation.getRelatedInformation(extension, query, types);
            },
            registerRelatedInformationProvider(type, provider) {
                checkProposedApiEnabled(extension, 'aiRelatedInformation');
                return extHostAiRelatedInformation.registerRelatedInformationProvider(extension, type, provider);
            },
            registerEmbeddingVectorProvider(model, provider) {
                checkProposedApiEnabled(extension, 'aiRelatedInformation');
                return extHostAiEmbeddingVector.registerEmbeddingVectorProvider(extension, model, provider);
            }
        };
        // namespace: chat
        const chat = {
            registerChatResponseProvider(id, provider, metadata) {
                checkProposedApiEnabled(extension, 'chatProvider');
                return extHostLanguageModels.registerLanguageModel(extension, id, provider, metadata);
            },
            registerChatVariableResolver(id, name, userDescription, modelDescription, isSlow, resolver, fullName, icon) {
                checkProposedApiEnabled(extension, 'chatVariableResolver');
                return extHostChatVariables.registerVariableResolver(extension, id, name, userDescription, modelDescription, isSlow, resolver, fullName, icon?.id);
            },
            registerMappedEditsProvider(selector, provider) {
                checkProposedApiEnabled(extension, 'mappedEditsProvider');
                return extHostLanguageFeatures.registerMappedEditsProvider(extension, selector, provider);
            },
            registerMappedEditsProvider2(provider) {
                checkProposedApiEnabled(extension, 'mappedEditsProvider');
                return extHostCodeMapper.registerMappedEditsProvider(extension, provider);
            },
            createChatParticipant(id, handler) {
                return extHostChatAgents2.createChatAgent(extension, id, handler);
            },
            createDynamicChatParticipant(id, dynamicProps, handler) {
                checkProposedApiEnabled(extension, 'chatParticipantPrivate');
                return extHostChatAgents2.createDynamicChatAgent(extension, id, dynamicProps, handler);
            },
            registerChatParticipantDetectionProvider(provider) {
                checkProposedApiEnabled(extension, 'chatParticipantAdditions');
                return extHostChatAgents2.registerChatParticipantDetectionProvider(extension, provider);
            },
        };
        // namespace: lm
        const lm = {
            selectChatModels: (selector) => {
                return extHostLanguageModels.selectLanguageModels(extension, selector ?? {});
            },
            onDidChangeChatModels: (listener, thisArgs, disposables) => {
                return extHostLanguageModels.onDidChangeProviders(listener, thisArgs, disposables);
            },
            registerChatModelProvider: (id, provider, metadata) => {
                checkProposedApiEnabled(extension, 'chatProvider');
                return extHostLanguageModels.registerLanguageModel(extension, id, provider, metadata);
            },
            // --- embeddings
            get embeddingModels() {
                checkProposedApiEnabled(extension, 'embeddings');
                return extHostEmbeddings.embeddingsModels;
            },
            onDidChangeEmbeddingModels: (listener, thisArgs, disposables) => {
                checkProposedApiEnabled(extension, 'embeddings');
                return extHostEmbeddings.onDidChange(listener, thisArgs, disposables);
            },
            registerEmbeddingsProvider(embeddingsModel, provider) {
                checkProposedApiEnabled(extension, 'embeddings');
                return extHostEmbeddings.registerEmbeddingsProvider(extension, embeddingsModel, provider);
            },
            async computeEmbeddings(embeddingsModel, input, token) {
                checkProposedApiEnabled(extension, 'embeddings');
                if (typeof input === 'string') {
                    return extHostEmbeddings.computeEmbeddings(embeddingsModel, input, token);
                }
                else {
                    return extHostEmbeddings.computeEmbeddings(embeddingsModel, input, token);
                }
            },
            registerTool(toolId, tool) {
                checkProposedApiEnabled(extension, 'lmTools');
                return extHostLanguageModelTools.registerTool(extension, toolId, tool);
            },
            invokeTool(toolId, parameters, token) {
                checkProposedApiEnabled(extension, 'lmTools');
                return extHostLanguageModelTools.invokeTool(toolId, parameters, token);
            },
            get tools() {
                checkProposedApiEnabled(extension, 'lmTools');
                return extHostLanguageModelTools.tools;
            },
        };
        // namespace: speech
        const speech = {
            registerSpeechProvider(id, provider) {
                checkProposedApiEnabled(extension, 'speech');
                return extHostSpeech.registerProvider(extension.identifier, id, provider);
            }
        };
        // eslint-disable-next-line local/code-no-dangerous-type-assertions
        return {
            version: initData.version,
            // namespaces
            ai,
            authentication,
            commands,
            comments,
            chat,
            debug,
            env,
            extensions,
            interactive,
            l10n,
            languages,
            lm,
            notebooks,
            scm,
            speech,
            tasks,
            tests,
            window,
            workspace,
            // types
            Breakpoint: extHostTypes.Breakpoint,
            TerminalOutputAnchor: extHostTypes.TerminalOutputAnchor,
            ChatResultFeedbackKind: extHostTypes.ChatResultFeedbackKind,
            ChatVariableLevel: extHostTypes.ChatVariableLevel,
            ChatCompletionItem: extHostTypes.ChatCompletionItem,
            CallHierarchyIncomingCall: extHostTypes.CallHierarchyIncomingCall,
            CallHierarchyItem: extHostTypes.CallHierarchyItem,
            CallHierarchyOutgoingCall: extHostTypes.CallHierarchyOutgoingCall,
            CancellationError: errors.CancellationError,
            CancellationTokenSource: CancellationTokenSource,
            CandidatePortSource: CandidatePortSource,
            CodeAction: extHostTypes.CodeAction,
            CodeActionKind: extHostTypes.CodeActionKind,
            CodeActionTriggerKind: extHostTypes.CodeActionTriggerKind,
            CodeLens: extHostTypes.CodeLens,
            Color: extHostTypes.Color,
            ColorInformation: extHostTypes.ColorInformation,
            ColorPresentation: extHostTypes.ColorPresentation,
            ColorThemeKind: extHostTypes.ColorThemeKind,
            CommentMode: extHostTypes.CommentMode,
            CommentState: extHostTypes.CommentState,
            CommentThreadCollapsibleState: extHostTypes.CommentThreadCollapsibleState,
            CommentThreadState: extHostTypes.CommentThreadState,
            CommentThreadApplicability: extHostTypes.CommentThreadApplicability,
            CommentThreadFocus: extHostTypes.CommentThreadFocus,
            CompletionItem: extHostTypes.CompletionItem,
            CompletionItemKind: extHostTypes.CompletionItemKind,
            CompletionItemTag: extHostTypes.CompletionItemTag,
            CompletionList: extHostTypes.CompletionList,
            CompletionTriggerKind: extHostTypes.CompletionTriggerKind,
            ConfigurationTarget: extHostTypes.ConfigurationTarget,
            CustomExecution: extHostTypes.CustomExecution,
            DebugAdapterExecutable: extHostTypes.DebugAdapterExecutable,
            DebugAdapterInlineImplementation: extHostTypes.DebugAdapterInlineImplementation,
            DebugAdapterNamedPipeServer: extHostTypes.DebugAdapterNamedPipeServer,
            DebugAdapterServer: extHostTypes.DebugAdapterServer,
            DebugConfigurationProviderTriggerKind: DebugConfigurationProviderTriggerKind,
            DebugConsoleMode: extHostTypes.DebugConsoleMode,
            DebugVisualization: extHostTypes.DebugVisualization,
            DecorationRangeBehavior: extHostTypes.DecorationRangeBehavior,
            Diagnostic: extHostTypes.Diagnostic,
            DiagnosticRelatedInformation: extHostTypes.DiagnosticRelatedInformation,
            DiagnosticSeverity: extHostTypes.DiagnosticSeverity,
            DiagnosticTag: extHostTypes.DiagnosticTag,
            Disposable: extHostTypes.Disposable,
            DocumentHighlight: extHostTypes.DocumentHighlight,
            DocumentHighlightKind: extHostTypes.DocumentHighlightKind,
            MultiDocumentHighlight: extHostTypes.MultiDocumentHighlight,
            DocumentLink: extHostTypes.DocumentLink,
            DocumentSymbol: extHostTypes.DocumentSymbol,
            EndOfLine: extHostTypes.EndOfLine,
            EnvironmentVariableMutatorType: extHostTypes.EnvironmentVariableMutatorType,
            EvaluatableExpression: extHostTypes.EvaluatableExpression,
            InlineValueText: extHostTypes.InlineValueText,
            InlineValueVariableLookup: extHostTypes.InlineValueVariableLookup,
            InlineValueEvaluatableExpression: extHostTypes.InlineValueEvaluatableExpression,
            InlineCompletionTriggerKind: extHostTypes.InlineCompletionTriggerKind,
            EventEmitter: Emitter,
            ExtensionKind: extHostTypes.ExtensionKind,
            ExtensionMode: extHostTypes.ExtensionMode,
            ExternalUriOpenerPriority: extHostTypes.ExternalUriOpenerPriority,
            FileChangeType: extHostTypes.FileChangeType,
            FileDecoration: extHostTypes.FileDecoration,
            FileDecoration2: extHostTypes.FileDecoration,
            FileSystemError: extHostTypes.FileSystemError,
            FileType: files.FileType,
            FilePermission: files.FilePermission,
            FoldingRange: extHostTypes.FoldingRange,
            FoldingRangeKind: extHostTypes.FoldingRangeKind,
            FunctionBreakpoint: extHostTypes.FunctionBreakpoint,
            InlineCompletionItem: extHostTypes.InlineSuggestion,
            InlineCompletionList: extHostTypes.InlineSuggestionList,
            Hover: extHostTypes.Hover,
            VerboseHover: extHostTypes.VerboseHover,
            HoverVerbosityAction: extHostTypes.HoverVerbosityAction,
            IndentAction: languageConfiguration.IndentAction,
            Location: extHostTypes.Location,
            MarkdownString: extHostTypes.MarkdownString,
            OverviewRulerLane: OverviewRulerLane,
            ParameterInformation: extHostTypes.ParameterInformation,
            PortAutoForwardAction: extHostTypes.PortAutoForwardAction,
            Position: extHostTypes.Position,
            ProcessExecution: extHostTypes.ProcessExecution,
            ProgressLocation: extHostTypes.ProgressLocation,
            QuickInputButtonLocation: extHostTypes.QuickInputButtonLocation,
            QuickInputButtons: extHostTypes.QuickInputButtons,
            Range: extHostTypes.Range,
            RelativePattern: extHostTypes.RelativePattern,
            Selection: extHostTypes.Selection,
            SelectionRange: extHostTypes.SelectionRange,
            SemanticTokens: extHostTypes.SemanticTokens,
            SemanticTokensBuilder: extHostTypes.SemanticTokensBuilder,
            SemanticTokensEdit: extHostTypes.SemanticTokensEdit,
            SemanticTokensEdits: extHostTypes.SemanticTokensEdits,
            SemanticTokensLegend: extHostTypes.SemanticTokensLegend,
            ShellExecution: extHostTypes.ShellExecution,
            ShellQuoting: extHostTypes.ShellQuoting,
            SignatureHelp: extHostTypes.SignatureHelp,
            SignatureHelpTriggerKind: extHostTypes.SignatureHelpTriggerKind,
            SignatureInformation: extHostTypes.SignatureInformation,
            SnippetString: extHostTypes.SnippetString,
            SourceBreakpoint: extHostTypes.SourceBreakpoint,
            StandardTokenType: extHostTypes.StandardTokenType,
            StatusBarAlignment: extHostTypes.StatusBarAlignment,
            SymbolInformation: extHostTypes.SymbolInformation,
            SymbolKind: extHostTypes.SymbolKind,
            SymbolTag: extHostTypes.SymbolTag,
            Task: extHostTypes.Task,
            TaskGroup: extHostTypes.TaskGroup,
            TaskPanelKind: extHostTypes.TaskPanelKind,
            TaskRevealKind: extHostTypes.TaskRevealKind,
            TaskScope: extHostTypes.TaskScope,
            TerminalLink: extHostTypes.TerminalLink,
            TerminalQuickFixTerminalCommand: extHostTypes.TerminalQuickFixCommand,
            TerminalQuickFixOpener: extHostTypes.TerminalQuickFixOpener,
            TerminalLocation: extHostTypes.TerminalLocation,
            TerminalProfile: extHostTypes.TerminalProfile,
            TerminalExitReason: extHostTypes.TerminalExitReason,
            TerminalShellExecutionCommandLineConfidence: extHostTypes.TerminalShellExecutionCommandLineConfidence,
            TextDocumentSaveReason: extHostTypes.TextDocumentSaveReason,
            TextEdit: extHostTypes.TextEdit,
            SnippetTextEdit: extHostTypes.SnippetTextEdit,
            TextEditorCursorStyle: TextEditorCursorStyle,
            TextEditorLineNumbersStyle: extHostTypes.TextEditorLineNumbersStyle,
            TextEditorRevealType: extHostTypes.TextEditorRevealType,
            TextEditorSelectionChangeKind: extHostTypes.TextEditorSelectionChangeKind,
            SyntaxTokenType: extHostTypes.SyntaxTokenType,
            TextDocumentChangeReason: extHostTypes.TextDocumentChangeReason,
            ThemeColor: extHostTypes.ThemeColor,
            ThemeIcon: extHostTypes.ThemeIcon,
            TreeItem: extHostTypes.TreeItem,
            TreeItemCheckboxState: extHostTypes.TreeItemCheckboxState,
            TreeItemCollapsibleState: extHostTypes.TreeItemCollapsibleState,
            TypeHierarchyItem: extHostTypes.TypeHierarchyItem,
            UIKind: UIKind,
            Uri: URI,
            ViewColumn: extHostTypes.ViewColumn,
            WorkspaceEdit: extHostTypes.WorkspaceEdit,
            // proposed api types
            DocumentPasteTriggerKind: extHostTypes.DocumentPasteTriggerKind,
            DocumentDropEdit: extHostTypes.DocumentDropEdit,
            DocumentDropOrPasteEditKind: extHostTypes.DocumentDropOrPasteEditKind,
            DocumentPasteEdit: extHostTypes.DocumentPasteEdit,
            InlayHint: extHostTypes.InlayHint,
            InlayHintLabelPart: extHostTypes.InlayHintLabelPart,
            InlayHintKind: extHostTypes.InlayHintKind,
            RemoteAuthorityResolverError: extHostTypes.RemoteAuthorityResolverError,
            ResolvedAuthority: extHostTypes.ResolvedAuthority,
            ManagedResolvedAuthority: extHostTypes.ManagedResolvedAuthority,
            SourceControlInputBoxValidationType: extHostTypes.SourceControlInputBoxValidationType,
            ExtensionRuntime: extHostTypes.ExtensionRuntime,
            TimelineItem: extHostTypes.TimelineItem,
            NotebookRange: extHostTypes.NotebookRange,
            NotebookCellKind: extHostTypes.NotebookCellKind,
            NotebookCellExecutionState: extHostTypes.NotebookCellExecutionState,
            NotebookCellData: extHostTypes.NotebookCellData,
            NotebookData: extHostTypes.NotebookData,
            NotebookRendererScript: extHostTypes.NotebookRendererScript,
            NotebookCellStatusBarAlignment: extHostTypes.NotebookCellStatusBarAlignment,
            NotebookEditorRevealType: extHostTypes.NotebookEditorRevealType,
            NotebookCellOutput: extHostTypes.NotebookCellOutput,
            NotebookCellOutputItem: extHostTypes.NotebookCellOutputItem,
            NotebookCellStatusBarItem: extHostTypes.NotebookCellStatusBarItem,
            NotebookControllerAffinity: extHostTypes.NotebookControllerAffinity,
            NotebookControllerAffinity2: extHostTypes.NotebookControllerAffinity2,
            NotebookEdit: extHostTypes.NotebookEdit,
            NotebookKernelSourceAction: extHostTypes.NotebookKernelSourceAction,
            NotebookVariablesRequestKind: extHostTypes.NotebookVariablesRequestKind,
            PortAttributes: extHostTypes.PortAttributes,
            LinkedEditingRanges: extHostTypes.LinkedEditingRanges,
            TestResultState: extHostTypes.TestResultState,
            TestRunRequest: extHostTypes.TestRunRequest,
            TestMessage: extHostTypes.TestMessage,
            TestMessageStackFrame: extHostTypes.TestMessageStackFrame,
            TestTag: extHostTypes.TestTag,
            TestRunProfileKind: extHostTypes.TestRunProfileKind,
            TextSearchCompleteMessageType: TextSearchCompleteMessageType,
            DataTransfer: extHostTypes.DataTransfer,
            DataTransferItem: extHostTypes.DataTransferItem,
            TestCoverageCount: extHostTypes.TestCoverageCount,
            FileCoverage: extHostTypes.FileCoverage,
            FileCoverage2: extHostTypes.FileCoverage,
            StatementCoverage: extHostTypes.StatementCoverage,
            BranchCoverage: extHostTypes.BranchCoverage,
            DeclarationCoverage: extHostTypes.DeclarationCoverage,
            WorkspaceTrustState: extHostTypes.WorkspaceTrustState,
            LanguageStatusSeverity: extHostTypes.LanguageStatusSeverity,
            QuickPickItemKind: extHostTypes.QuickPickItemKind,
            InputBoxValidationSeverity: extHostTypes.InputBoxValidationSeverity,
            TabInputText: extHostTypes.TextTabInput,
            TabInputTextDiff: extHostTypes.TextDiffTabInput,
            TabInputTextMerge: extHostTypes.TextMergeTabInput,
            TabInputCustom: extHostTypes.CustomEditorTabInput,
            TabInputNotebook: extHostTypes.NotebookEditorTabInput,
            TabInputNotebookDiff: extHostTypes.NotebookDiffEditorTabInput,
            TabInputWebview: extHostTypes.WebviewEditorTabInput,
            TabInputTerminal: extHostTypes.TerminalEditorTabInput,
            TabInputInteractiveWindow: extHostTypes.InteractiveWindowInput,
            TabInputChat: extHostTypes.ChatEditorTabInput,
            TabInputTextMultiDiff: extHostTypes.TextMultiDiffTabInput,
            TelemetryTrustedValue: TelemetryTrustedValue,
            LogLevel: LogLevel,
            EditSessionIdentityMatch: EditSessionIdentityMatch,
            InteractiveSessionVoteDirection: extHostTypes.InteractiveSessionVoteDirection,
            ChatCopyKind: extHostTypes.ChatCopyKind,
            ChatEditingSessionActionOutcome: extHostTypes.ChatEditingSessionActionOutcome,
            InteractiveEditorResponseFeedbackKind: extHostTypes.InteractiveEditorResponseFeedbackKind,
            DebugStackFrame: extHostTypes.DebugStackFrame,
            DebugThread: extHostTypes.DebugThread,
            RelatedInformationType: extHostTypes.RelatedInformationType,
            SpeechToTextStatus: extHostTypes.SpeechToTextStatus,
            TextToSpeechStatus: extHostTypes.TextToSpeechStatus,
            PartialAcceptTriggerKind: extHostTypes.PartialAcceptTriggerKind,
            KeywordRecognitionStatus: extHostTypes.KeywordRecognitionStatus,
            ChatResponseMarkdownPart: extHostTypes.ChatResponseMarkdownPart,
            ChatResponseFileTreePart: extHostTypes.ChatResponseFileTreePart,
            ChatResponseAnchorPart: extHostTypes.ChatResponseAnchorPart,
            ChatResponseProgressPart: extHostTypes.ChatResponseProgressPart,
            ChatResponseProgressPart2: extHostTypes.ChatResponseProgressPart2,
            ChatResponseReferencePart: extHostTypes.ChatResponseReferencePart,
            ChatResponseReferencePart2: extHostTypes.ChatResponseReferencePart,
            ChatResponseCodeCitationPart: extHostTypes.ChatResponseCodeCitationPart,
            ChatResponseCodeblockUriPart: extHostTypes.ChatResponseCodeblockUriPart,
            ChatResponseWarningPart: extHostTypes.ChatResponseWarningPart,
            ChatResponseTextEditPart: extHostTypes.ChatResponseTextEditPart,
            ChatResponseMarkdownWithVulnerabilitiesPart: extHostTypes.ChatResponseMarkdownWithVulnerabilitiesPart,
            ChatResponseCommandButtonPart: extHostTypes.ChatResponseCommandButtonPart,
            ChatResponseDetectedParticipantPart: extHostTypes.ChatResponseDetectedParticipantPart,
            ChatResponseConfirmationPart: extHostTypes.ChatResponseConfirmationPart,
            ChatResponseMovePart: extHostTypes.ChatResponseMovePart,
            ChatResponseReferencePartStatusKind: extHostTypes.ChatResponseReferencePartStatusKind,
            ChatRequestTurn: extHostTypes.ChatRequestTurn,
            ChatResponseTurn: extHostTypes.ChatResponseTurn,
            ChatLocation: extHostTypes.ChatLocation,
            ChatRequestEditorData: extHostTypes.ChatRequestEditorData,
            ChatRequestNotebookData: extHostTypes.ChatRequestNotebookData,
            ChatReferenceBinaryData: extHostTypes.ChatReferenceBinaryData,
            LanguageModelChatMessageRole: extHostTypes.LanguageModelChatMessageRole,
            LanguageModelChatMessage: extHostTypes.LanguageModelChatMessage,
            LanguageModelChatMessageToolResultPart: extHostTypes.LanguageModelToolResultPart,
            LanguageModelChatResponseTextPart: extHostTypes.LanguageModelTextPart,
            LanguageModelChatResponseToolCallPart: extHostTypes.LanguageModelToolCallPart,
            LanguageModelError: extHostTypes.LanguageModelError,
            NewSymbolName: extHostTypes.NewSymbolName,
            NewSymbolNameTag: extHostTypes.NewSymbolNameTag,
            NewSymbolNameTriggerKind: extHostTypes.NewSymbolNameTriggerKind,
            InlineEdit: extHostTypes.InlineEdit,
            InlineEditTriggerKind: extHostTypes.InlineEditTriggerKind,
            ExcludeSettingOptions: ExcludeSettingOptions,
            TextSearchContextNew: TextSearchContextNew,
            TextSearchMatchNew: TextSearchMatchNew,
            TextSearchCompleteMessageTypeNew: TextSearchCompleteMessageType,
        };
    };
}
