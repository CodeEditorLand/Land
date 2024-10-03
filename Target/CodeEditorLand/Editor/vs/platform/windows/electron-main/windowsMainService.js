var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import * as fs from 'fs';
import { app, BrowserWindow, shell } from 'electron';
import { addUNCHostToAllowlist } from '../../../base/node/unc.js';
import { hostname, release, arch } from 'os';
import { coalesce, distinct } from '../../../base/common/arrays.js';
import { CancellationToken } from '../../../base/common/cancellation.js';
import { Emitter, Event } from '../../../base/common/event.js';
import { isWindowsDriveLetter, parseLineAndColumnAware, sanitizeFilePath, toSlashes } from '../../../base/common/extpath.js';
import { getPathLabel } from '../../../base/common/labels.js';
import { Disposable, DisposableStore } from '../../../base/common/lifecycle.js';
import { Schemas } from '../../../base/common/network.js';
import { basename, join, normalize, posix } from '../../../base/common/path.js';
import { getMarks, mark } from '../../../base/common/performance.js';
import { isMacintosh, isWindows, OS } from '../../../base/common/platform.js';
import { cwd } from '../../../base/common/process.js';
import { extUriBiasedIgnorePathCase, isEqualAuthority, normalizePath, originalFSPath, removeTrailingPathSeparator } from '../../../base/common/resources.js';
import { assertIsDefined } from '../../../base/common/types.js';
import { URI } from '../../../base/common/uri.js';
import { getNLSLanguage, getNLSMessages, localize } from '../../../nls.js';
import { IBackupMainService } from '../../backup/electron-main/backup.js';
import { IConfigurationService } from '../../configuration/common/configuration.js';
import { IDialogMainService } from '../../dialogs/electron-main/dialogMainService.js';
import { IEnvironmentMainService } from '../../environment/electron-main/environmentMainService.js';
import { FileType, IFileService } from '../../files/common/files.js';
import { IInstantiationService } from '../../instantiation/common/instantiation.js';
import { ILifecycleMainService } from '../../lifecycle/electron-main/lifecycleMainService.js';
import { ILogService } from '../../log/common/log.js';
import product from '../../product/common/product.js';
import { IProtocolMainService } from '../../protocol/electron-main/protocol.js';
import { getRemoteAuthority } from '../../remote/common/remoteHosts.js';
import { IStateService } from '../../state/node/state.js';
import { isFileToOpen, isFolderToOpen, isWorkspaceToOpen } from '../../window/common/window.js';
import { CodeWindow } from './windowImpl.js';
import { getLastFocused } from './windows.js';
import { findWindowOnExtensionDevelopmentPath, findWindowOnFile, findWindowOnWorkspaceOrFolder } from './windowsFinder.js';
import { WindowsStateHandler } from './windowsStateHandler.js';
import { hasWorkspaceFileExtension, isSingleFolderWorkspaceIdentifier, isWorkspaceIdentifier, toWorkspaceIdentifier } from '../../workspace/common/workspace.js';
import { createEmptyWorkspaceIdentifier, getSingleFolderWorkspaceIdentifier, getWorkspaceIdentifier } from '../../workspaces/node/workspaces.js';
import { IWorkspacesHistoryMainService } from '../../workspaces/electron-main/workspacesHistoryMainService.js';
import { IWorkspacesManagementMainService } from '../../workspaces/electron-main/workspacesManagementMainService.js';
import { IThemeMainService } from '../../theme/electron-main/themeMainService.js';
import { IPolicyService } from '../../policy/common/policy.js';
import { IUserDataProfilesMainService } from '../../userDataProfile/electron-main/userDataProfile.js';
import { ILoggerMainService } from '../../log/electron-main/loggerService.js';
import { IAuxiliaryWindowsMainService } from '../../auxiliaryWindow/electron-main/auxiliaryWindows.js';
import { ICSSDevelopmentService } from '../../cssDev/node/cssDevService.js';
function isWorkspacePathToOpen(path) {
    return isWorkspaceIdentifier(path?.workspace);
}
function isSingleFolderWorkspacePathToOpen(path) {
    return isSingleFolderWorkspaceIdentifier(path?.workspace);
}
let WindowsMainService = class WindowsMainService extends Disposable {
    constructor(machineId, sqmId, devDeviceId, initialUserEnv, logService, loggerService, stateService, policyService, environmentMainService, userDataProfilesMainService, lifecycleMainService, backupMainService, configurationService, workspacesHistoryMainService, workspacesManagementMainService, instantiationService, dialogMainService, fileService, protocolMainService, themeMainService, auxiliaryWindowsMainService, cssDevelopmentService) {
        super();
        this.machineId = machineId;
        this.sqmId = sqmId;
        this.devDeviceId = devDeviceId;
        this.initialUserEnv = initialUserEnv;
        this.logService = logService;
        this.loggerService = loggerService;
        this.stateService = stateService;
        this.policyService = policyService;
        this.environmentMainService = environmentMainService;
        this.userDataProfilesMainService = userDataProfilesMainService;
        this.lifecycleMainService = lifecycleMainService;
        this.backupMainService = backupMainService;
        this.configurationService = configurationService;
        this.workspacesHistoryMainService = workspacesHistoryMainService;
        this.workspacesManagementMainService = workspacesManagementMainService;
        this.instantiationService = instantiationService;
        this.dialogMainService = dialogMainService;
        this.fileService = fileService;
        this.protocolMainService = protocolMainService;
        this.themeMainService = themeMainService;
        this.auxiliaryWindowsMainService = auxiliaryWindowsMainService;
        this.cssDevelopmentService = cssDevelopmentService;
        this._onDidOpenWindow = this._register(new Emitter());
        this.onDidOpenWindow = this._onDidOpenWindow.event;
        this._onDidSignalReadyWindow = this._register(new Emitter());
        this.onDidSignalReadyWindow = this._onDidSignalReadyWindow.event;
        this._onDidDestroyWindow = this._register(new Emitter());
        this.onDidDestroyWindow = this._onDidDestroyWindow.event;
        this._onDidChangeWindowsCount = this._register(new Emitter());
        this.onDidChangeWindowsCount = this._onDidChangeWindowsCount.event;
        this._onDidMaximizeWindow = this._register(new Emitter());
        this.onDidMaximizeWindow = this._onDidMaximizeWindow.event;
        this._onDidUnmaximizeWindow = this._register(new Emitter());
        this.onDidUnmaximizeWindow = this._onDidUnmaximizeWindow.event;
        this._onDidChangeFullScreen = this._register(new Emitter());
        this.onDidChangeFullScreen = this._onDidChangeFullScreen.event;
        this._onDidTriggerSystemContextMenu = this._register(new Emitter());
        this.onDidTriggerSystemContextMenu = this._onDidTriggerSystemContextMenu.event;
        this.windows = new Map();
        this.windowsStateHandler = this._register(new WindowsStateHandler(this, this.stateService, this.lifecycleMainService, this.logService, this.configurationService));
        this.registerListeners();
    }
    registerListeners() {
        this._register(this.workspacesManagementMainService.onDidEnterWorkspace(event => this._onDidSignalReadyWindow.fire(event.window)));
        this._register(this.onDidSignalReadyWindow(window => {
            if (window.config?.extensionDevelopmentPath || window.config?.extensionTestsPath) {
                const disposables = new DisposableStore();
                disposables.add(Event.any(window.onDidClose, window.onDidDestroy)(() => disposables.dispose()));
                if (window.config.extensionDevelopmentPath) {
                    for (const extensionDevelopmentPath of window.config.extensionDevelopmentPath) {
                        disposables.add(this.protocolMainService.addValidFileRoot(extensionDevelopmentPath));
                    }
                }
                if (window.config.extensionTestsPath) {
                    disposables.add(this.protocolMainService.addValidFileRoot(window.config.extensionTestsPath));
                }
            }
        }));
    }
    openEmptyWindow(openConfig, options) {
        const cli = this.environmentMainService.args;
        const remoteAuthority = options?.remoteAuthority || undefined;
        const forceEmpty = true;
        const forceReuseWindow = options?.forceReuseWindow;
        const forceNewWindow = !forceReuseWindow;
        return this.open({ ...openConfig, cli, forceEmpty, forceNewWindow, forceReuseWindow, remoteAuthority, forceTempProfile: options?.forceTempProfile, forceProfile: options?.forceProfile });
    }
    openExistingWindow(window, openConfig) {
        window.focus();
        this.handleWaitMarkerFile(openConfig, [window]);
    }
    async open(openConfig) {
        this.logService.trace('windowsManager#open');
        if (openConfig.addMode && (openConfig.initialStartup || !this.getLastActiveWindow())) {
            openConfig.addMode = false;
        }
        const foldersToAdd = [];
        const foldersToOpen = [];
        const workspacesToOpen = [];
        const untitledWorkspacesToRestore = [];
        const emptyWindowsWithBackupsToRestore = [];
        let filesToOpen;
        let openOneEmptyWindow = false;
        const pathsToOpen = await this.getPathsToOpen(openConfig);
        this.logService.trace('windowsManager#open pathsToOpen', pathsToOpen);
        for (const path of pathsToOpen) {
            if (isSingleFolderWorkspacePathToOpen(path)) {
                if (openConfig.addMode) {
                    foldersToAdd.push(path);
                }
                else {
                    foldersToOpen.push(path);
                }
            }
            else if (isWorkspacePathToOpen(path)) {
                workspacesToOpen.push(path);
            }
            else if (path.fileUri) {
                if (!filesToOpen) {
                    filesToOpen = { filesToOpenOrCreate: [], filesToDiff: [], filesToMerge: [], remoteAuthority: path.remoteAuthority };
                }
                filesToOpen.filesToOpenOrCreate.push(path);
            }
            else if (path.backupPath) {
                emptyWindowsWithBackupsToRestore.push({ backupFolder: basename(path.backupPath), remoteAuthority: path.remoteAuthority });
            }
            else {
                openOneEmptyWindow = true;
            }
        }
        if (openConfig.diffMode && filesToOpen && filesToOpen.filesToOpenOrCreate.length >= 2) {
            filesToOpen.filesToDiff = filesToOpen.filesToOpenOrCreate.slice(0, 2);
            filesToOpen.filesToOpenOrCreate = [];
        }
        if (openConfig.mergeMode && filesToOpen && filesToOpen.filesToOpenOrCreate.length === 4) {
            filesToOpen.filesToMerge = filesToOpen.filesToOpenOrCreate.slice(0, 4);
            filesToOpen.filesToOpenOrCreate = [];
            filesToOpen.filesToDiff = [];
        }
        if (filesToOpen && openConfig.waitMarkerFileURI) {
            filesToOpen.filesToWait = { paths: coalesce([...filesToOpen.filesToDiff, filesToOpen.filesToMerge[3], ...filesToOpen.filesToOpenOrCreate]), waitMarkerFileUri: openConfig.waitMarkerFileURI };
        }
        if (openConfig.initialStartup) {
            untitledWorkspacesToRestore.push(...this.workspacesManagementMainService.getUntitledWorkspaces());
            workspacesToOpen.push(...untitledWorkspacesToRestore);
            emptyWindowsWithBackupsToRestore.push(...this.backupMainService.getEmptyWindowBackups());
        }
        else {
            emptyWindowsWithBackupsToRestore.length = 0;
        }
        const { windows: usedWindows, filesOpenedInWindow } = await this.doOpen(openConfig, workspacesToOpen, foldersToOpen, emptyWindowsWithBackupsToRestore, openOneEmptyWindow, filesToOpen, foldersToAdd);
        this.logService.trace(`windowsManager#open used window count ${usedWindows.length} (workspacesToOpen: ${workspacesToOpen.length}, foldersToOpen: ${foldersToOpen.length}, emptyToRestore: ${emptyWindowsWithBackupsToRestore.length}, openOneEmptyWindow: ${openOneEmptyWindow})`);
        if (usedWindows.length > 1) {
            if (filesOpenedInWindow) {
                filesOpenedInWindow.focus();
            }
            else {
                const focusLastActive = this.windowsStateHandler.state.lastActiveWindow && !openConfig.forceEmpty && !openConfig.cli._.length && !openConfig.cli['file-uri'] && !openConfig.cli['folder-uri'] && !(openConfig.urisToOpen && openConfig.urisToOpen.length);
                let focusLastOpened = true;
                let focusLastWindow = true;
                if (focusLastActive) {
                    const lastActiveWindow = usedWindows.filter(window => this.windowsStateHandler.state.lastActiveWindow && window.backupPath === this.windowsStateHandler.state.lastActiveWindow.backupPath);
                    if (lastActiveWindow.length) {
                        lastActiveWindow[0].focus();
                        focusLastOpened = false;
                        focusLastWindow = false;
                    }
                }
                if (focusLastOpened) {
                    for (let i = usedWindows.length - 1; i >= 0; i--) {
                        const usedWindow = usedWindows[i];
                        if ((usedWindow.openedWorkspace && untitledWorkspacesToRestore.some(workspace => usedWindow.openedWorkspace && workspace.workspace.id === usedWindow.openedWorkspace.id)) ||
                            (usedWindow.backupPath && emptyWindowsWithBackupsToRestore.some(empty => usedWindow.backupPath && empty.backupFolder === basename(usedWindow.backupPath)))) {
                            continue;
                        }
                        usedWindow.focus();
                        focusLastWindow = false;
                        break;
                    }
                }
                if (focusLastWindow) {
                    usedWindows[usedWindows.length - 1].focus();
                }
            }
        }
        const isDiff = filesToOpen && filesToOpen.filesToDiff.length > 0;
        const isMerge = filesToOpen && filesToOpen.filesToMerge.length > 0;
        if (!usedWindows.some(window => window.isExtensionDevelopmentHost) && !isDiff && !isMerge && !openConfig.noRecentEntry) {
            const recents = [];
            for (const pathToOpen of pathsToOpen) {
                if (isWorkspacePathToOpen(pathToOpen) && !pathToOpen.transient) {
                    recents.push({ label: pathToOpen.label, workspace: pathToOpen.workspace, remoteAuthority: pathToOpen.remoteAuthority });
                }
                else if (isSingleFolderWorkspacePathToOpen(pathToOpen)) {
                    recents.push({ label: pathToOpen.label, folderUri: pathToOpen.workspace.uri, remoteAuthority: pathToOpen.remoteAuthority });
                }
                else if (pathToOpen.fileUri) {
                    recents.push({ label: pathToOpen.label, fileUri: pathToOpen.fileUri, remoteAuthority: pathToOpen.remoteAuthority });
                }
            }
            this.workspacesHistoryMainService.addRecentlyOpened(recents);
        }
        this.handleWaitMarkerFile(openConfig, usedWindows);
        return usedWindows;
    }
    handleWaitMarkerFile(openConfig, usedWindows) {
        const waitMarkerFileURI = openConfig.waitMarkerFileURI;
        if (openConfig.context === 0 && waitMarkerFileURI && usedWindows.length === 1 && usedWindows[0]) {
            (async () => {
                await usedWindows[0].whenClosedOrLoaded;
                try {
                    await this.fileService.del(waitMarkerFileURI);
                }
                catch (error) {
                }
            })();
        }
    }
    async doOpen(openConfig, workspacesToOpen, foldersToOpen, emptyToRestore, openOneEmptyWindow, filesToOpen, foldersToAdd) {
        const usedWindows = [];
        let filesOpenedInWindow = undefined;
        function addUsedWindow(window, openedFiles) {
            usedWindows.push(window);
            if (openedFiles) {
                filesOpenedInWindow = window;
                filesToOpen = undefined;
            }
        }
        let { openFolderInNewWindow, openFilesInNewWindow } = this.shouldOpenNewWindow(openConfig);
        if (!openConfig.initialStartup && foldersToAdd.length > 0) {
            const authority = foldersToAdd[0].remoteAuthority;
            const lastActiveWindow = this.getLastActiveWindowForAuthority(authority);
            if (lastActiveWindow) {
                addUsedWindow(this.doAddFoldersToExistingWindow(lastActiveWindow, foldersToAdd.map(folderToAdd => folderToAdd.workspace.uri)));
            }
        }
        const potentialNewWindowsCount = foldersToOpen.length + workspacesToOpen.length + emptyToRestore.length;
        if (filesToOpen && potentialNewWindowsCount === 0) {
            const fileToCheck = filesToOpen.filesToOpenOrCreate[0] || filesToOpen.filesToDiff[0] || filesToOpen.filesToMerge[3];
            const windows = this.getWindows().filter(window => filesToOpen && isEqualAuthority(window.remoteAuthority, filesToOpen.remoteAuthority));
            let windowToUseForFiles = undefined;
            if (fileToCheck?.fileUri && !openFilesInNewWindow) {
                if (openConfig.context === 4 || openConfig.context === 0 || openConfig.context === 1 || openConfig.context === 6) {
                    windowToUseForFiles = await findWindowOnFile(windows, fileToCheck.fileUri, async (workspace) => workspace.configPath.scheme === Schemas.file ? this.workspacesManagementMainService.resolveLocalWorkspace(workspace.configPath) : undefined);
                }
                if (!windowToUseForFiles) {
                    windowToUseForFiles = this.doGetLastActiveWindow(windows);
                }
            }
            if (windowToUseForFiles) {
                if (isWorkspaceIdentifier(windowToUseForFiles.openedWorkspace)) {
                    workspacesToOpen.push({ workspace: windowToUseForFiles.openedWorkspace, remoteAuthority: windowToUseForFiles.remoteAuthority });
                }
                else if (isSingleFolderWorkspaceIdentifier(windowToUseForFiles.openedWorkspace)) {
                    foldersToOpen.push({ workspace: windowToUseForFiles.openedWorkspace, remoteAuthority: windowToUseForFiles.remoteAuthority });
                }
                else {
                    addUsedWindow(this.doOpenFilesInExistingWindow(openConfig, windowToUseForFiles, filesToOpen), true);
                }
            }
            else {
                addUsedWindow(await this.openInBrowserWindow({
                    userEnv: openConfig.userEnv,
                    cli: openConfig.cli,
                    initialStartup: openConfig.initialStartup,
                    filesToOpen,
                    forceNewWindow: true,
                    remoteAuthority: filesToOpen.remoteAuthority,
                    forceNewTabbedWindow: openConfig.forceNewTabbedWindow,
                    forceProfile: openConfig.forceProfile,
                    forceTempProfile: openConfig.forceTempProfile
                }), true);
            }
        }
        const allWorkspacesToOpen = distinct(workspacesToOpen, workspace => workspace.workspace.id);
        if (allWorkspacesToOpen.length > 0) {
            const windowsOnWorkspace = coalesce(allWorkspacesToOpen.map(workspaceToOpen => findWindowOnWorkspaceOrFolder(this.getWindows(), workspaceToOpen.workspace.configPath)));
            if (windowsOnWorkspace.length > 0) {
                const windowOnWorkspace = windowsOnWorkspace[0];
                const filesToOpenInWindow = isEqualAuthority(filesToOpen?.remoteAuthority, windowOnWorkspace.remoteAuthority) ? filesToOpen : undefined;
                addUsedWindow(this.doOpenFilesInExistingWindow(openConfig, windowOnWorkspace, filesToOpenInWindow), !!filesToOpenInWindow);
                openFolderInNewWindow = true;
            }
            for (const workspaceToOpen of allWorkspacesToOpen) {
                if (windowsOnWorkspace.some(window => window.openedWorkspace && window.openedWorkspace.id === workspaceToOpen.workspace.id)) {
                    continue;
                }
                const remoteAuthority = workspaceToOpen.remoteAuthority;
                const filesToOpenInWindow = isEqualAuthority(filesToOpen?.remoteAuthority, remoteAuthority) ? filesToOpen : undefined;
                addUsedWindow(await this.doOpenFolderOrWorkspace(openConfig, workspaceToOpen, openFolderInNewWindow, filesToOpenInWindow), !!filesToOpenInWindow);
                openFolderInNewWindow = true;
            }
        }
        const allFoldersToOpen = distinct(foldersToOpen, folder => extUriBiasedIgnorePathCase.getComparisonKey(folder.workspace.uri));
        if (allFoldersToOpen.length > 0) {
            const windowsOnFolderPath = coalesce(allFoldersToOpen.map(folderToOpen => findWindowOnWorkspaceOrFolder(this.getWindows(), folderToOpen.workspace.uri)));
            if (windowsOnFolderPath.length > 0) {
                const windowOnFolderPath = windowsOnFolderPath[0];
                const filesToOpenInWindow = isEqualAuthority(filesToOpen?.remoteAuthority, windowOnFolderPath.remoteAuthority) ? filesToOpen : undefined;
                addUsedWindow(this.doOpenFilesInExistingWindow(openConfig, windowOnFolderPath, filesToOpenInWindow), !!filesToOpenInWindow);
                openFolderInNewWindow = true;
            }
            for (const folderToOpen of allFoldersToOpen) {
                if (windowsOnFolderPath.some(window => isSingleFolderWorkspaceIdentifier(window.openedWorkspace) && extUriBiasedIgnorePathCase.isEqual(window.openedWorkspace.uri, folderToOpen.workspace.uri))) {
                    continue;
                }
                const remoteAuthority = folderToOpen.remoteAuthority;
                const filesToOpenInWindow = isEqualAuthority(filesToOpen?.remoteAuthority, remoteAuthority) ? filesToOpen : undefined;
                addUsedWindow(await this.doOpenFolderOrWorkspace(openConfig, folderToOpen, openFolderInNewWindow, filesToOpenInWindow), !!filesToOpenInWindow);
                openFolderInNewWindow = true;
            }
        }
        const allEmptyToRestore = distinct(emptyToRestore, info => info.backupFolder);
        if (allEmptyToRestore.length > 0) {
            for (const emptyWindowBackupInfo of allEmptyToRestore) {
                const remoteAuthority = emptyWindowBackupInfo.remoteAuthority;
                const filesToOpenInWindow = isEqualAuthority(filesToOpen?.remoteAuthority, remoteAuthority) ? filesToOpen : undefined;
                addUsedWindow(await this.doOpenEmpty(openConfig, true, remoteAuthority, filesToOpenInWindow, emptyWindowBackupInfo), !!filesToOpenInWindow);
                openFolderInNewWindow = true;
            }
        }
        if (filesToOpen || openOneEmptyWindow) {
            const remoteAuthority = filesToOpen ? filesToOpen.remoteAuthority : openConfig.remoteAuthority;
            addUsedWindow(await this.doOpenEmpty(openConfig, openFolderInNewWindow, remoteAuthority, filesToOpen), !!filesToOpen);
        }
        return { windows: distinct(usedWindows), filesOpenedInWindow };
    }
    doOpenFilesInExistingWindow(configuration, window, filesToOpen) {
        this.logService.trace('windowsManager#doOpenFilesInExistingWindow', { filesToOpen });
        this.focusMainOrChildWindow(window);
        const params = {
            filesToOpenOrCreate: filesToOpen?.filesToOpenOrCreate,
            filesToDiff: filesToOpen?.filesToDiff,
            filesToMerge: filesToOpen?.filesToMerge,
            filesToWait: filesToOpen?.filesToWait,
            termProgram: configuration?.userEnv?.['TERM_PROGRAM']
        };
        window.sendWhenReady('vscode:openFiles', CancellationToken.None, params);
        return window;
    }
    focusMainOrChildWindow(mainWindow) {
        let windowToFocus = mainWindow;
        const focusedWindow = BrowserWindow.getFocusedWindow();
        if (focusedWindow && focusedWindow.id !== mainWindow.id) {
            const auxiliaryWindowCandidate = this.auxiliaryWindowsMainService.getWindowByWebContents(focusedWindow.webContents);
            if (auxiliaryWindowCandidate && auxiliaryWindowCandidate.parentId === mainWindow.id) {
                windowToFocus = auxiliaryWindowCandidate;
            }
        }
        windowToFocus.focus();
    }
    doAddFoldersToExistingWindow(window, foldersToAdd) {
        this.logService.trace('windowsManager#doAddFoldersToExistingWindow', { foldersToAdd });
        window.focus();
        const request = { foldersToAdd };
        window.sendWhenReady('vscode:addFolders', CancellationToken.None, request);
        return window;
    }
    doOpenEmpty(openConfig, forceNewWindow, remoteAuthority, filesToOpen, emptyWindowBackupInfo) {
        this.logService.trace('windowsManager#doOpenEmpty', { restore: !!emptyWindowBackupInfo, remoteAuthority, filesToOpen, forceNewWindow });
        let windowToUse;
        if (!forceNewWindow && typeof openConfig.contextWindowId === 'number') {
            windowToUse = this.getWindowById(openConfig.contextWindowId);
        }
        return this.openInBrowserWindow({
            userEnv: openConfig.userEnv,
            cli: openConfig.cli,
            initialStartup: openConfig.initialStartup,
            remoteAuthority,
            forceNewWindow,
            forceNewTabbedWindow: openConfig.forceNewTabbedWindow,
            filesToOpen,
            windowToUse,
            emptyWindowBackupInfo,
            forceProfile: openConfig.forceProfile,
            forceTempProfile: openConfig.forceTempProfile
        });
    }
    doOpenFolderOrWorkspace(openConfig, folderOrWorkspace, forceNewWindow, filesToOpen, windowToUse) {
        this.logService.trace('windowsManager#doOpenFolderOrWorkspace', { folderOrWorkspace, filesToOpen });
        if (!forceNewWindow && !windowToUse && typeof openConfig.contextWindowId === 'number') {
            windowToUse = this.getWindowById(openConfig.contextWindowId);
        }
        return this.openInBrowserWindow({
            workspace: folderOrWorkspace.workspace,
            userEnv: openConfig.userEnv,
            cli: openConfig.cli,
            initialStartup: openConfig.initialStartup,
            remoteAuthority: folderOrWorkspace.remoteAuthority,
            forceNewWindow,
            forceNewTabbedWindow: openConfig.forceNewTabbedWindow,
            filesToOpen,
            windowToUse,
            forceProfile: openConfig.forceProfile,
            forceTempProfile: openConfig.forceTempProfile
        });
    }
    async getPathsToOpen(openConfig) {
        let pathsToOpen;
        let isCommandLineOrAPICall = false;
        let restoredWindows = false;
        if (openConfig.urisToOpen && openConfig.urisToOpen.length > 0) {
            pathsToOpen = await this.doExtractPathsFromAPI(openConfig);
            isCommandLineOrAPICall = true;
        }
        else if (openConfig.forceEmpty) {
            pathsToOpen = [Object.create(null)];
        }
        else if (openConfig.cli._.length || openConfig.cli['folder-uri'] || openConfig.cli['file-uri']) {
            pathsToOpen = await this.doExtractPathsFromCLI(openConfig.cli);
            if (pathsToOpen.length === 0) {
                pathsToOpen.push(Object.create(null));
            }
            isCommandLineOrAPICall = true;
        }
        else {
            pathsToOpen = await this.doGetPathsFromLastSession();
            if (pathsToOpen.length === 0) {
                pathsToOpen.push(Object.create(null));
            }
            restoredWindows = true;
        }
        if (!openConfig.addMode && isCommandLineOrAPICall) {
            const foldersToOpen = pathsToOpen.filter(path => isSingleFolderWorkspacePathToOpen(path));
            if (foldersToOpen.length > 1) {
                const remoteAuthority = foldersToOpen[0].remoteAuthority;
                if (foldersToOpen.every(folderToOpen => isEqualAuthority(folderToOpen.remoteAuthority, remoteAuthority))) {
                    const workspace = await this.workspacesManagementMainService.createUntitledWorkspace(foldersToOpen.map(folder => ({ uri: folder.workspace.uri })));
                    pathsToOpen.push({ workspace, remoteAuthority });
                    pathsToOpen = pathsToOpen.filter(path => !isSingleFolderWorkspacePathToOpen(path));
                }
            }
        }
        if (openConfig.initialStartup && !restoredWindows && this.configurationService.getValue('window')?.restoreWindows === 'preserve') {
            const lastSessionPaths = await this.doGetPathsFromLastSession();
            pathsToOpen.unshift(...lastSessionPaths.filter(path => isWorkspacePathToOpen(path) || isSingleFolderWorkspacePathToOpen(path) || path.backupPath));
        }
        return pathsToOpen;
    }
    async doExtractPathsFromAPI(openConfig) {
        const pathResolveOptions = {
            gotoLineMode: openConfig.gotoLineMode,
            remoteAuthority: openConfig.remoteAuthority
        };
        const pathsToOpen = await Promise.all(coalesce(openConfig.urisToOpen || []).map(async (pathToOpen) => {
            const path = await this.resolveOpenable(pathToOpen, pathResolveOptions);
            if (path) {
                path.label = pathToOpen.label;
                return path;
            }
            const uri = this.resourceFromOpenable(pathToOpen);
            this.dialogMainService.showMessageBox({
                type: 'info',
                buttons: [localize({ key: 'ok', comment: ['&& denotes a mnemonic'] }, "&&OK")],
                message: uri.scheme === Schemas.file ? localize('pathNotExistTitle', "Path does not exist") : localize('uriInvalidTitle', "URI can not be opened"),
                detail: uri.scheme === Schemas.file ?
                    localize('pathNotExistDetail', "The path '{0}' does not exist on this computer.", getPathLabel(uri, { os: OS, tildify: this.environmentMainService })) :
                    localize('uriInvalidDetail', "The URI '{0}' is not valid and can not be opened.", uri.toString(true))
            }, BrowserWindow.getFocusedWindow() ?? undefined);
            return undefined;
        }));
        return coalesce(pathsToOpen);
    }
    async doExtractPathsFromCLI(cli) {
        const pathsToOpen = [];
        const pathResolveOptions = {
            ignoreFileNotFound: true,
            gotoLineMode: cli.goto,
            remoteAuthority: cli.remote || undefined,
            forceOpenWorkspaceAsFile: cli.diff && cli._.length === 2 ||
                cli.merge && cli._.length === 4
        };
        const folderUris = cli['folder-uri'];
        if (folderUris) {
            const resolvedFolderUris = await Promise.all(folderUris.map(rawFolderUri => {
                const folderUri = this.cliArgToUri(rawFolderUri);
                if (!folderUri) {
                    return undefined;
                }
                return this.resolveOpenable({ folderUri }, pathResolveOptions);
            }));
            pathsToOpen.push(...coalesce(resolvedFolderUris));
        }
        const fileUris = cli['file-uri'];
        if (fileUris) {
            const resolvedFileUris = await Promise.all(fileUris.map(rawFileUri => {
                const fileUri = this.cliArgToUri(rawFileUri);
                if (!fileUri) {
                    return undefined;
                }
                return this.resolveOpenable(hasWorkspaceFileExtension(rawFileUri) ? { workspaceUri: fileUri } : { fileUri }, pathResolveOptions);
            }));
            pathsToOpen.push(...coalesce(resolvedFileUris));
        }
        const resolvedCliPaths = await Promise.all(cli._.map(cliPath => {
            return pathResolveOptions.remoteAuthority ? this.doResolveRemotePath(cliPath, pathResolveOptions) : this.doResolveFilePath(cliPath, pathResolveOptions);
        }));
        pathsToOpen.push(...coalesce(resolvedCliPaths));
        return pathsToOpen;
    }
    cliArgToUri(arg) {
        try {
            const uri = URI.parse(arg);
            if (!uri.scheme) {
                this.logService.error(`Invalid URI input string, scheme missing: ${arg}`);
                return undefined;
            }
            if (!uri.path) {
                return uri.with({ path: '/' });
            }
            return uri;
        }
        catch (e) {
            this.logService.error(`Invalid URI input string: ${arg}, ${e.message}`);
        }
        return undefined;
    }
    async doGetPathsFromLastSession() {
        const restoreWindowsSetting = this.getRestoreWindowsSetting();
        switch (restoreWindowsSetting) {
            case 'none':
                return [];
            case 'one':
            case 'all':
            case 'preserve':
            case 'folders': {
                const lastSessionWindows = [];
                if (restoreWindowsSetting !== 'one') {
                    lastSessionWindows.push(...this.windowsStateHandler.state.openedWindows);
                }
                if (this.windowsStateHandler.state.lastActiveWindow) {
                    lastSessionWindows.push(this.windowsStateHandler.state.lastActiveWindow);
                }
                const pathsToOpen = await Promise.all(lastSessionWindows.map(async (lastSessionWindow) => {
                    if (lastSessionWindow.workspace) {
                        const pathToOpen = await this.resolveOpenable({ workspaceUri: lastSessionWindow.workspace.configPath }, { remoteAuthority: lastSessionWindow.remoteAuthority, rejectTransientWorkspaces: true });
                        if (isWorkspacePathToOpen(pathToOpen)) {
                            return pathToOpen;
                        }
                    }
                    else if (lastSessionWindow.folderUri) {
                        const pathToOpen = await this.resolveOpenable({ folderUri: lastSessionWindow.folderUri }, { remoteAuthority: lastSessionWindow.remoteAuthority });
                        if (isSingleFolderWorkspacePathToOpen(pathToOpen)) {
                            return pathToOpen;
                        }
                    }
                    else if (restoreWindowsSetting !== 'folders' && lastSessionWindow.backupPath) {
                        return { backupPath: lastSessionWindow.backupPath, remoteAuthority: lastSessionWindow.remoteAuthority };
                    }
                    return undefined;
                }));
                return coalesce(pathsToOpen);
            }
        }
    }
    getRestoreWindowsSetting() {
        let restoreWindows;
        if (this.lifecycleMainService.wasRestarted) {
            restoreWindows = 'all';
        }
        else {
            const windowConfig = this.configurationService.getValue('window');
            restoreWindows = windowConfig?.restoreWindows || 'all';
            if (!['preserve', 'all', 'folders', 'one', 'none'].includes(restoreWindows)) {
                restoreWindows = 'all';
            }
        }
        return restoreWindows;
    }
    async resolveOpenable(openable, options = Object.create(null)) {
        const uri = this.resourceFromOpenable(openable);
        if (uri.scheme === Schemas.file) {
            if (isFileToOpen(openable)) {
                options = { ...options, forceOpenWorkspaceAsFile: true };
            }
            return this.doResolveFilePath(uri.fsPath, options);
        }
        return this.doResolveRemoteOpenable(openable, options);
    }
    doResolveRemoteOpenable(openable, options) {
        let uri = this.resourceFromOpenable(openable);
        const remoteAuthority = getRemoteAuthority(uri) || options.remoteAuthority;
        uri = removeTrailingPathSeparator(normalizePath(uri));
        if (isFileToOpen(openable)) {
            if (options.gotoLineMode) {
                const { path, line, column } = parseLineAndColumnAware(uri.path);
                return {
                    fileUri: uri.with({ path }),
                    options: {
                        selection: line ? { startLineNumber: line, startColumn: column || 1 } : undefined
                    },
                    remoteAuthority
                };
            }
            return { fileUri: uri, remoteAuthority };
        }
        else if (isWorkspaceToOpen(openable)) {
            return { workspace: getWorkspaceIdentifier(uri), remoteAuthority };
        }
        return { workspace: getSingleFolderWorkspaceIdentifier(uri), remoteAuthority };
    }
    resourceFromOpenable(openable) {
        if (isWorkspaceToOpen(openable)) {
            return openable.workspaceUri;
        }
        if (isFolderToOpen(openable)) {
            return openable.folderUri;
        }
        return openable.fileUri;
    }
    async doResolveFilePath(path, options, skipHandleUNCError) {
        let lineNumber;
        let columnNumber;
        if (options.gotoLineMode) {
            ({ path, line: lineNumber, column: columnNumber } = parseLineAndColumnAware(path));
        }
        path = sanitizeFilePath(normalize(path), cwd());
        try {
            const pathStat = await fs.promises.stat(path);
            if (pathStat.isFile()) {
                if (!options.forceOpenWorkspaceAsFile) {
                    const workspace = await this.workspacesManagementMainService.resolveLocalWorkspace(URI.file(path));
                    if (workspace) {
                        if (workspace.transient && options.rejectTransientWorkspaces) {
                            return undefined;
                        }
                        return {
                            workspace: { id: workspace.id, configPath: workspace.configPath },
                            type: FileType.File,
                            exists: true,
                            remoteAuthority: workspace.remoteAuthority,
                            transient: workspace.transient
                        };
                    }
                }
                return {
                    fileUri: URI.file(path),
                    type: FileType.File,
                    exists: true,
                    options: {
                        selection: lineNumber ? { startLineNumber: lineNumber, startColumn: columnNumber || 1 } : undefined
                    }
                };
            }
            else if (pathStat.isDirectory()) {
                return {
                    workspace: getSingleFolderWorkspaceIdentifier(URI.file(path), pathStat),
                    type: FileType.Directory,
                    exists: true
                };
            }
            else if (!isWindows && path === '/dev/null') {
                return {
                    fileUri: URI.file(path),
                    type: FileType.File,
                    exists: true
                };
            }
        }
        catch (error) {
            if (error.code === 'ERR_UNC_HOST_NOT_ALLOWED' && !skipHandleUNCError) {
                return this.onUNCHostNotAllowed(path, options);
            }
            const fileUri = URI.file(path);
            this.workspacesHistoryMainService.removeRecentlyOpened([fileUri]);
            if (options.ignoreFileNotFound) {
                return {
                    fileUri,
                    type: FileType.File,
                    exists: false
                };
            }
        }
        return undefined;
    }
    async onUNCHostNotAllowed(path, options) {
        const uri = URI.file(path);
        const { response, checkboxChecked } = await this.dialogMainService.showMessageBox({
            type: 'warning',
            buttons: [
                localize({ key: 'allow', comment: ['&& denotes a mnemonic'] }, "&&Allow"),
                localize({ key: 'cancel', comment: ['&& denotes a mnemonic'] }, "&&Cancel"),
                localize({ key: 'learnMore', comment: ['&& denotes a mnemonic'] }, "&&Learn More"),
            ],
            message: localize('confirmOpenMessage', "The host '{0}' was not found in the list of allowed hosts. Do you want to allow it anyway?", uri.authority),
            detail: localize('confirmOpenDetail', "The path '{0}' uses a host that is not allowed. Unless you trust the host, you should press 'Cancel'", getPathLabel(uri, { os: OS, tildify: this.environmentMainService })),
            checkboxLabel: localize('doNotAskAgain', "Permanently allow host '{0}'", uri.authority),
            cancelId: 1
        });
        if (response === 0) {
            addUNCHostToAllowlist(uri.authority);
            if (checkboxChecked) {
                const request = { channel: 'vscode:configureAllowedUNCHost', args: uri.authority };
                this.sendToFocused(request.channel, request.args);
                this.sendToOpeningWindow(request.channel, request.args);
            }
            return this.doResolveFilePath(path, options, true);
        }
        if (response === 2) {
            shell.openExternal('https://aka.ms/vscode-windows-unc');
            return this.onUNCHostNotAllowed(path, options);
        }
        return undefined;
    }
    doResolveRemotePath(path, options) {
        const first = path.charCodeAt(0);
        const remoteAuthority = options.remoteAuthority;
        let lineNumber;
        let columnNumber;
        if (options.gotoLineMode) {
            ({ path, line: lineNumber, column: columnNumber } = parseLineAndColumnAware(path));
        }
        if (first !== 47) {
            if (isWindowsDriveLetter(first) && path.charCodeAt(path.charCodeAt(1)) === 58) {
                path = toSlashes(path);
            }
            path = `/${path}`;
        }
        const uri = URI.from({ scheme: Schemas.vscodeRemote, authority: remoteAuthority, path: path });
        if (path.charCodeAt(path.length - 1) !== 47) {
            if (hasWorkspaceFileExtension(path)) {
                if (options.forceOpenWorkspaceAsFile) {
                    return {
                        fileUri: uri,
                        options: {
                            selection: lineNumber ? { startLineNumber: lineNumber, startColumn: columnNumber || 1 } : undefined
                        },
                        remoteAuthority: options.remoteAuthority
                    };
                }
                return { workspace: getWorkspaceIdentifier(uri), remoteAuthority };
            }
            else if (options.gotoLineMode || posix.basename(path).indexOf('.') !== -1) {
                return {
                    fileUri: uri,
                    options: {
                        selection: lineNumber ? { startLineNumber: lineNumber, startColumn: columnNumber || 1 } : undefined
                    },
                    remoteAuthority
                };
            }
        }
        return { workspace: getSingleFolderWorkspaceIdentifier(uri), remoteAuthority };
    }
    shouldOpenNewWindow(openConfig) {
        const windowConfig = this.configurationService.getValue('window');
        const openFolderInNewWindowConfig = windowConfig?.openFoldersInNewWindow || 'default';
        const openFilesInNewWindowConfig = windowConfig?.openFilesInNewWindow || 'off';
        let openFolderInNewWindow = (openConfig.preferNewWindow || openConfig.forceNewWindow) && !openConfig.forceReuseWindow;
        if (!openConfig.forceNewWindow && !openConfig.forceReuseWindow && (openFolderInNewWindowConfig === 'on' || openFolderInNewWindowConfig === 'off')) {
            openFolderInNewWindow = (openFolderInNewWindowConfig === 'on');
        }
        let openFilesInNewWindow = false;
        if (openConfig.forceNewWindow || openConfig.forceReuseWindow) {
            openFilesInNewWindow = !!openConfig.forceNewWindow && !openConfig.forceReuseWindow;
        }
        else {
            if (isMacintosh) {
                if (openConfig.context === 1) {
                    openFilesInNewWindow = true;
                }
            }
            else {
                if (openConfig.context !== 3 && openConfig.context !== 2 && !(openConfig.userEnv && openConfig.userEnv['TERM_PROGRAM'] === 'vscode')) {
                    openFilesInNewWindow = true;
                }
            }
            if (!openConfig.cli.extensionDevelopmentPath && (openFilesInNewWindowConfig === 'on' || openFilesInNewWindowConfig === 'off')) {
                openFilesInNewWindow = (openFilesInNewWindowConfig === 'on');
            }
        }
        return { openFolderInNewWindow: !!openFolderInNewWindow, openFilesInNewWindow };
    }
    async openExtensionDevelopmentHostWindow(extensionDevelopmentPaths, openConfig) {
        const existingWindow = findWindowOnExtensionDevelopmentPath(this.getWindows(), extensionDevelopmentPaths);
        if (existingWindow) {
            this.lifecycleMainService.reload(existingWindow, openConfig.cli);
            existingWindow.focus();
            return [existingWindow];
        }
        let folderUris = openConfig.cli['folder-uri'] || [];
        let fileUris = openConfig.cli['file-uri'] || [];
        let cliArgs = openConfig.cli._;
        if (!cliArgs.length && !folderUris.length && !fileUris.length && !openConfig.cli.extensionTestsPath) {
            const extensionDevelopmentWindowState = this.windowsStateHandler.state.lastPluginDevelopmentHostWindow;
            const workspaceToOpen = extensionDevelopmentWindowState?.workspace ?? extensionDevelopmentWindowState?.folderUri;
            if (workspaceToOpen) {
                if (URI.isUri(workspaceToOpen)) {
                    if (workspaceToOpen.scheme === Schemas.file) {
                        cliArgs = [workspaceToOpen.fsPath];
                    }
                    else {
                        folderUris = [workspaceToOpen.toString()];
                    }
                }
                else {
                    if (workspaceToOpen.configPath.scheme === Schemas.file) {
                        cliArgs = [originalFSPath(workspaceToOpen.configPath)];
                    }
                    else {
                        fileUris = [workspaceToOpen.configPath.toString()];
                    }
                }
            }
        }
        let remoteAuthority = openConfig.remoteAuthority;
        for (const extensionDevelopmentPath of extensionDevelopmentPaths) {
            if (extensionDevelopmentPath.match(/^[a-zA-Z][a-zA-Z0-9\+\-\.]+:/)) {
                const url = URI.parse(extensionDevelopmentPath);
                const extensionDevelopmentPathRemoteAuthority = getRemoteAuthority(url);
                if (extensionDevelopmentPathRemoteAuthority) {
                    if (remoteAuthority) {
                        if (!isEqualAuthority(extensionDevelopmentPathRemoteAuthority, remoteAuthority)) {
                            this.logService.error('more than one extension development path authority');
                        }
                    }
                    else {
                        remoteAuthority = extensionDevelopmentPathRemoteAuthority;
                    }
                }
            }
        }
        cliArgs = cliArgs.filter(path => {
            const uri = URI.file(path);
            if (!!findWindowOnWorkspaceOrFolder(this.getWindows(), uri)) {
                return false;
            }
            return isEqualAuthority(getRemoteAuthority(uri), remoteAuthority);
        });
        folderUris = folderUris.filter(folderUriStr => {
            const folderUri = this.cliArgToUri(folderUriStr);
            if (folderUri && !!findWindowOnWorkspaceOrFolder(this.getWindows(), folderUri)) {
                return false;
            }
            return folderUri ? isEqualAuthority(getRemoteAuthority(folderUri), remoteAuthority) : false;
        });
        fileUris = fileUris.filter(fileUriStr => {
            const fileUri = this.cliArgToUri(fileUriStr);
            if (fileUri && !!findWindowOnWorkspaceOrFolder(this.getWindows(), fileUri)) {
                return false;
            }
            return fileUri ? isEqualAuthority(getRemoteAuthority(fileUri), remoteAuthority) : false;
        });
        openConfig.cli._ = cliArgs;
        openConfig.cli['folder-uri'] = folderUris;
        openConfig.cli['file-uri'] = fileUris;
        const openArgs = {
            context: openConfig.context,
            cli: openConfig.cli,
            forceNewWindow: true,
            forceEmpty: !cliArgs.length && !folderUris.length && !fileUris.length,
            userEnv: openConfig.userEnv,
            noRecentEntry: true,
            waitMarkerFileURI: openConfig.waitMarkerFileURI,
            remoteAuthority,
            forceProfile: openConfig.forceProfile,
            forceTempProfile: openConfig.forceTempProfile
        };
        return this.open(openArgs);
    }
    async openInBrowserWindow(options) {
        const windowConfig = this.configurationService.getValue('window');
        const lastActiveWindow = this.getLastActiveWindow();
        const newWindowProfile = windowConfig?.newWindowProfile
            ? this.userDataProfilesMainService.profiles.find(profile => profile.name === windowConfig.newWindowProfile) : undefined;
        const defaultProfile = newWindowProfile ?? lastActiveWindow?.profile ?? this.userDataProfilesMainService.defaultProfile;
        let window;
        if (!options.forceNewWindow && !options.forceNewTabbedWindow) {
            window = options.windowToUse || lastActiveWindow;
            if (window) {
                window.focus();
            }
        }
        const configuration = {
            ...this.environmentMainService.args,
            ...options.cli,
            machineId: this.machineId,
            sqmId: this.sqmId,
            devDeviceId: this.devDeviceId,
            windowId: -1,
            mainPid: process.pid,
            appRoot: this.environmentMainService.appRoot,
            execPath: process.execPath,
            codeCachePath: this.environmentMainService.codeCachePath,
            backupPath: options.emptyWindowBackupInfo ? join(this.environmentMainService.backupHome, options.emptyWindowBackupInfo.backupFolder) : undefined,
            profiles: {
                home: this.userDataProfilesMainService.profilesHome,
                all: this.userDataProfilesMainService.profiles,
                profile: defaultProfile
            },
            homeDir: this.environmentMainService.userHome.with({ scheme: Schemas.file }).fsPath,
            tmpDir: this.environmentMainService.tmpDir.with({ scheme: Schemas.file }).fsPath,
            userDataDir: this.environmentMainService.userDataPath,
            remoteAuthority: options.remoteAuthority,
            workspace: options.workspace,
            userEnv: { ...this.initialUserEnv, ...options.userEnv },
            nls: {
                messages: getNLSMessages(),
                language: getNLSLanguage()
            },
            filesToOpenOrCreate: options.filesToOpen?.filesToOpenOrCreate,
            filesToDiff: options.filesToOpen?.filesToDiff,
            filesToMerge: options.filesToOpen?.filesToMerge,
            filesToWait: options.filesToOpen?.filesToWait,
            logLevel: this.loggerService.getLogLevel(),
            loggers: {
                window: [],
                global: this.loggerService.getRegisteredLoggers()
            },
            logsPath: this.environmentMainService.logsHome.with({ scheme: Schemas.file }).fsPath,
            product,
            isInitialStartup: options.initialStartup,
            perfMarks: getMarks(),
            os: { release: release(), hostname: hostname(), arch: arch() },
            autoDetectHighContrast: windowConfig?.autoDetectHighContrast ?? true,
            autoDetectColorScheme: windowConfig?.autoDetectColorScheme ?? false,
            accessibilitySupport: app.accessibilitySupportEnabled,
            colorScheme: this.themeMainService.getColorScheme(),
            policiesData: this.policyService.serialize(),
            continueOn: this.environmentMainService.continueOn,
            cssModules: this.cssDevelopmentService.isEnabled ? await this.cssDevelopmentService.getCssModules() : undefined
        };
        if (!window) {
            const state = this.windowsStateHandler.getNewWindowState(configuration);
            mark('code/willCreateCodeWindow');
            const createdWindow = window = this.instantiationService.createInstance(CodeWindow, {
                state,
                extensionDevelopmentPath: configuration.extensionDevelopmentPath,
                isExtensionTestHost: !!configuration.extensionTestsPath
            });
            mark('code/didCreateCodeWindow');
            if (options.forceNewTabbedWindow) {
                const activeWindow = this.getLastActiveWindow();
                activeWindow?.addTabbedWindow(createdWindow);
            }
            this.windows.set(createdWindow.id, createdWindow);
            this._onDidOpenWindow.fire(createdWindow);
            this._onDidChangeWindowsCount.fire({ oldCount: this.getWindowCount() - 1, newCount: this.getWindowCount() });
            const disposables = new DisposableStore();
            disposables.add(createdWindow.onDidSignalReady(() => this._onDidSignalReadyWindow.fire(createdWindow)));
            disposables.add(Event.once(createdWindow.onDidClose)(() => this.onWindowClosed(createdWindow, disposables)));
            disposables.add(Event.once(createdWindow.onDidDestroy)(() => this.onWindowDestroyed(createdWindow)));
            disposables.add(createdWindow.onDidMaximize(() => this._onDidMaximizeWindow.fire(createdWindow)));
            disposables.add(createdWindow.onDidUnmaximize(() => this._onDidUnmaximizeWindow.fire(createdWindow)));
            disposables.add(createdWindow.onDidEnterFullScreen(() => this._onDidChangeFullScreen.fire({ window: createdWindow, fullscreen: true })));
            disposables.add(createdWindow.onDidLeaveFullScreen(() => this._onDidChangeFullScreen.fire({ window: createdWindow, fullscreen: false })));
            disposables.add(createdWindow.onDidTriggerSystemContextMenu(({ x, y }) => this._onDidTriggerSystemContextMenu.fire({ window: createdWindow, x, y })));
            const webContents = assertIsDefined(createdWindow.win?.webContents);
            webContents.removeAllListeners('devtools-reload-page');
            disposables.add(Event.fromNodeEventEmitter(webContents, 'devtools-reload-page')(() => this.lifecycleMainService.reload(createdWindow)));
            this.lifecycleMainService.registerWindow(createdWindow);
        }
        else {
            const currentWindowConfig = window.config;
            if (!configuration.extensionDevelopmentPath && currentWindowConfig?.extensionDevelopmentPath) {
                configuration.extensionDevelopmentPath = currentWindowConfig.extensionDevelopmentPath;
                configuration.extensionDevelopmentKind = currentWindowConfig.extensionDevelopmentKind;
                configuration['enable-proposed-api'] = currentWindowConfig['enable-proposed-api'];
                configuration.verbose = currentWindowConfig.verbose;
                configuration['inspect-extensions'] = currentWindowConfig['inspect-extensions'];
                configuration['inspect-brk-extensions'] = currentWindowConfig['inspect-brk-extensions'];
                configuration.debugId = currentWindowConfig.debugId;
                configuration.extensionEnvironment = currentWindowConfig.extensionEnvironment;
                configuration['extensions-dir'] = currentWindowConfig['extensions-dir'];
                configuration['disable-extensions'] = currentWindowConfig['disable-extensions'];
            }
            configuration.loggers = {
                global: configuration.loggers.global,
                window: currentWindowConfig?.loggers.window ?? configuration.loggers.window
            };
        }
        configuration.windowId = window.id;
        if (window.isReady) {
            this.lifecycleMainService.unload(window, 4).then(async (veto) => {
                if (!veto) {
                    await this.doOpenInBrowserWindow(window, configuration, options, defaultProfile);
                }
            });
        }
        else {
            await this.doOpenInBrowserWindow(window, configuration, options, defaultProfile);
        }
        return window;
    }
    async doOpenInBrowserWindow(window, configuration, options, defaultProfile) {
        if (!configuration.extensionDevelopmentPath) {
            if (isWorkspaceIdentifier(configuration.workspace)) {
                configuration.backupPath = this.backupMainService.registerWorkspaceBackup({
                    workspace: configuration.workspace,
                    remoteAuthority: configuration.remoteAuthority
                });
            }
            else if (isSingleFolderWorkspaceIdentifier(configuration.workspace)) {
                configuration.backupPath = this.backupMainService.registerFolderBackup({
                    folderUri: configuration.workspace.uri,
                    remoteAuthority: configuration.remoteAuthority
                });
            }
            else {
                configuration.backupPath = this.backupMainService.registerEmptyWindowBackup({
                    backupFolder: options.emptyWindowBackupInfo?.backupFolder ?? createEmptyWorkspaceIdentifier().id,
                    remoteAuthority: configuration.remoteAuthority
                });
            }
        }
        if (this.userDataProfilesMainService.isEnabled()) {
            const workspace = configuration.workspace ?? toWorkspaceIdentifier(configuration.backupPath, false);
            const profilePromise = this.resolveProfileForBrowserWindow(options, workspace, defaultProfile);
            const profile = profilePromise instanceof Promise ? await profilePromise : profilePromise;
            configuration.profiles.profile = profile;
            if (!configuration.extensionDevelopmentPath) {
                await this.userDataProfilesMainService.setProfileForWorkspace(workspace, profile);
            }
        }
        window.load(configuration);
    }
    resolveProfileForBrowserWindow(options, workspace, defaultProfile) {
        if (options.forceProfile) {
            return this.userDataProfilesMainService.profiles.find(p => p.name === options.forceProfile) ?? this.userDataProfilesMainService.createNamedProfile(options.forceProfile);
        }
        if (options.forceTempProfile) {
            return this.userDataProfilesMainService.createTransientProfile();
        }
        return this.userDataProfilesMainService.getProfileForWorkspace(workspace) ?? defaultProfile;
    }
    onWindowClosed(window, disposables) {
        this.windows.delete(window.id);
        this._onDidChangeWindowsCount.fire({ oldCount: this.getWindowCount() + 1, newCount: this.getWindowCount() });
        disposables.dispose();
    }
    onWindowDestroyed(window) {
        this.windows.delete(window.id);
        this._onDidDestroyWindow.fire(window);
    }
    getFocusedWindow() {
        const window = BrowserWindow.getFocusedWindow();
        if (window) {
            return this.getWindowById(window.id);
        }
        return undefined;
    }
    getLastActiveWindow() {
        return this.doGetLastActiveWindow(this.getWindows());
    }
    getLastActiveWindowForAuthority(remoteAuthority) {
        return this.doGetLastActiveWindow(this.getWindows().filter(window => isEqualAuthority(window.remoteAuthority, remoteAuthority)));
    }
    doGetLastActiveWindow(windows) {
        return getLastFocused(windows);
    }
    sendToFocused(channel, ...args) {
        const focusedWindow = this.getFocusedWindow() || this.getLastActiveWindow();
        focusedWindow?.sendWhenReady(channel, CancellationToken.None, ...args);
    }
    sendToOpeningWindow(channel, ...args) {
        this._register(Event.once(this.onDidSignalReadyWindow)(window => {
            window.sendWhenReady(channel, CancellationToken.None, ...args);
        }));
    }
    sendToAll(channel, payload, windowIdsToIgnore) {
        for (const window of this.getWindows()) {
            if (windowIdsToIgnore && windowIdsToIgnore.indexOf(window.id) >= 0) {
                continue;
            }
            window.sendWhenReady(channel, CancellationToken.None, payload);
        }
    }
    getWindows() {
        return Array.from(this.windows.values());
    }
    getWindowCount() {
        return this.windows.size;
    }
    getWindowById(windowId) {
        return this.windows.get(windowId);
    }
    getWindowByWebContents(webContents) {
        const browserWindow = BrowserWindow.fromWebContents(webContents);
        if (!browserWindow) {
            return undefined;
        }
        const window = this.getWindowById(browserWindow.id);
        return window?.matches(webContents) ? window : undefined;
    }
};
WindowsMainService = __decorate([
    __param(4, ILogService),
    __param(5, ILoggerMainService),
    __param(6, IStateService),
    __param(7, IPolicyService),
    __param(8, IEnvironmentMainService),
    __param(9, IUserDataProfilesMainService),
    __param(10, ILifecycleMainService),
    __param(11, IBackupMainService),
    __param(12, IConfigurationService),
    __param(13, IWorkspacesHistoryMainService),
    __param(14, IWorkspacesManagementMainService),
    __param(15, IInstantiationService),
    __param(16, IDialogMainService),
    __param(17, IFileService),
    __param(18, IProtocolMainService),
    __param(19, IThemeMainService),
    __param(20, IAuxiliaryWindowsMainService),
    __param(21, ICSSDevelopmentService),
    __metadata("design:paramtypes", [String, String, String, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], WindowsMainService);
export { WindowsMainService };
