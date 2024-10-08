/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
var IssueMainService_1;
import { BrowserWindow, screen } from 'electron';
import { arch, release, type } from 'os';
import { raceTimeout } from '../../../base/common/async.js';
import { CancellationTokenSource } from '../../../base/common/cancellation.js';
import { DisposableStore } from '../../../base/common/lifecycle.js';
import { FileAccess } from '../../../base/common/network.js';
import { isMacintosh } from '../../../base/common/platform.js';
import { validatedIpcMain } from '../../../base/parts/ipc/electron-main/ipcMain.js';
import { getNLSLanguage, getNLSMessages, localize } from '../../../nls.js';
import { IDialogMainService } from '../../dialogs/electron-main/dialogMainService.js';
import { IEnvironmentMainService } from '../../environment/electron-main/environmentMainService.js';
import { ILogService } from '../../log/common/log.js';
import { INativeHostMainService } from '../../native/electron-main/nativeHostMainService.js';
import product from '../../product/common/product.js';
import { IProtocolMainService } from '../../protocol/electron-main/protocol.js';
import { zoomLevelToZoomFactor } from '../../window/common/window.js';
import { IWindowsMainService } from '../../windows/electron-main/windows.js';
import { ICSSDevelopmentService } from '../../cssDev/node/cssDevService.js';
let IssueMainService = class IssueMainService {
    static { IssueMainService_1 = this; }
    static { this.DEFAULT_BACKGROUND_COLOR = '#1E1E1E'; }
    constructor(userEnv, environmentMainService, logService, dialogMainService, nativeHostMainService, protocolMainService, windowsMainService, cssDevelopmentService) {
        this.userEnv = userEnv;
        this.environmentMainService = environmentMainService;
        this.logService = logService;
        this.dialogMainService = dialogMainService;
        this.nativeHostMainService = nativeHostMainService;
        this.protocolMainService = protocolMainService;
        this.windowsMainService = windowsMainService;
        this.cssDevelopmentService = cssDevelopmentService;
        this.issueReporterWindow = null;
        this.issueReporterParentWindow = null;
    }
    //#region Used by renderer
    async openReporter(data) {
        if (!this.issueReporterWindow) {
            this.issueReporterParentWindow = BrowserWindow.getFocusedWindow();
            if (this.issueReporterParentWindow) {
                const issueReporterDisposables = new DisposableStore();
                const issueReporterWindowConfigUrl = issueReporterDisposables.add(this.protocolMainService.createIPCObjectUrl());
                const position = this.getWindowPosition(this.issueReporterParentWindow, 700, 800);
                this.issueReporterWindow = this.createBrowserWindow(position, issueReporterWindowConfigUrl, {
                    backgroundColor: data.styles.backgroundColor,
                    title: localize('issueReporter', "Issue Reporter"),
                    zoomLevel: data.zoomLevel,
                    alwaysOnTop: false
                }, 'issue-reporter');
                // Store into config object URL
                issueReporterWindowConfigUrl.update({
                    appRoot: this.environmentMainService.appRoot,
                    windowId: this.issueReporterWindow.id,
                    userEnv: this.userEnv,
                    data,
                    disableExtensions: !!this.environmentMainService.disableExtensions,
                    os: {
                        type: type(),
                        arch: arch(),
                        release: release(),
                    },
                    product,
                    nls: {
                        messages: getNLSMessages(),
                        language: getNLSLanguage()
                    },
                    cssModules: this.cssDevelopmentService.isEnabled ? await this.cssDevelopmentService.getCssModules() : undefined
                });
                this.issueReporterWindow.loadURL(FileAccess.asBrowserUri(`vs/workbench/contrib/issue/electron-sandbox/issueReporter${this.environmentMainService.isBuilt ? '' : '-dev'}.html`).toString(true));
                this.issueReporterWindow.on('close', () => {
                    this.issueReporterWindow = null;
                    issueReporterDisposables.dispose();
                });
                this.issueReporterParentWindow.on('closed', () => {
                    if (this.issueReporterWindow) {
                        this.issueReporterWindow.close();
                        this.issueReporterWindow = null;
                        issueReporterDisposables.dispose();
                    }
                });
            }
        }
        else if (this.issueReporterWindow) {
            this.focusWindow(this.issueReporterWindow);
        }
    }
    //#endregion
    //#region used by issue reporter window
    async $reloadWithExtensionsDisabled() {
        if (this.issueReporterParentWindow) {
            try {
                await this.nativeHostMainService.reload(this.issueReporterParentWindow.id, { disableExtensions: true });
            }
            catch (error) {
                this.logService.error(error);
            }
        }
    }
    async $showConfirmCloseDialog() {
        if (this.issueReporterWindow) {
            const { response } = await this.dialogMainService.showMessageBox({
                type: 'warning',
                message: localize('confirmCloseIssueReporter', "Your input will not be saved. Are you sure you want to close this window?"),
                buttons: [
                    localize({ key: 'yes', comment: ['&& denotes a mnemonic'] }, "&&Yes"),
                    localize('cancel', "Cancel")
                ]
            }, this.issueReporterWindow);
            if (response === 0) {
                if (this.issueReporterWindow) {
                    this.issueReporterWindow.destroy();
                    this.issueReporterWindow = null;
                }
            }
        }
    }
    async $showClipboardDialog() {
        if (this.issueReporterWindow) {
            const { response } = await this.dialogMainService.showMessageBox({
                type: 'warning',
                message: localize('issueReporterWriteToClipboard', "There is too much data to send to GitHub directly. The data will be copied to the clipboard, please paste it into the GitHub issue page that is opened."),
                buttons: [
                    localize({ key: 'ok', comment: ['&& denotes a mnemonic'] }, "&&OK"),
                    localize('cancel', "Cancel")
                ]
            }, this.issueReporterWindow);
            return response === 0;
        }
        return false;
    }
    issueReporterWindowCheck() {
        if (!this.issueReporterParentWindow) {
            throw new Error('Issue reporter window not available');
        }
        const window = this.windowsMainService.getWindowById(this.issueReporterParentWindow.id);
        if (!window) {
            throw new Error('Window not found');
        }
        return window;
    }
    async $sendReporterMenu(extensionId, extensionName) {
        const window = this.issueReporterWindowCheck();
        const replyChannel = `vscode:triggerReporterMenu`;
        const cts = new CancellationTokenSource();
        window.sendWhenReady(replyChannel, cts.token, { replyChannel, extensionId, extensionName });
        const result = await raceTimeout(new Promise(resolve => validatedIpcMain.once(`vscode:triggerReporterMenuResponse:${extensionId}`, (_, data) => resolve(data))), 5000, () => {
            this.logService.error(`Error: Extension ${extensionId} timed out waiting for menu response`);
            cts.cancel();
        });
        return result;
    }
    async $closeReporter() {
        this.issueReporterWindow?.close();
    }
    //#endregion
    focusWindow(window) {
        if (window.isMinimized()) {
            window.restore();
        }
        window.focus();
    }
    createBrowserWindow(position, ipcObjectUrl, options, windowKind) {
        const windowOptions = {
            fullscreen: false,
            skipTaskbar: false,
            resizable: true,
            width: position.width,
            height: position.height,
            minWidth: 300,
            minHeight: 200,
            x: position.x,
            y: position.y,
            title: options.title,
            backgroundColor: options.backgroundColor || IssueMainService_1.DEFAULT_BACKGROUND_COLOR,
            webPreferences: {
                preload: FileAccess.asFileUri('vs/base/parts/sandbox/electron-sandbox/preload.js').fsPath,
                additionalArguments: [`--vscode-window-config=${ipcObjectUrl.resource.toString()}`],
                v8CacheOptions: this.environmentMainService.useCodeCache ? 'bypassHeatCheck' : 'none',
                enableWebSQL: false,
                spellcheck: false,
                zoomFactor: zoomLevelToZoomFactor(options.zoomLevel),
                sandbox: true
            },
            alwaysOnTop: options.alwaysOnTop,
            experimentalDarkMode: true
        };
        const window = new BrowserWindow(windowOptions);
        window.setMenuBarVisibility(false);
        return window;
    }
    getWindowPosition(parentWindow, defaultWidth, defaultHeight) {
        // We want the new window to open on the same display that the parent is in
        let displayToUse;
        const displays = screen.getAllDisplays();
        // Single Display
        if (displays.length === 1) {
            displayToUse = displays[0];
        }
        // Multi Display
        else {
            // on mac there is 1 menu per window so we need to use the monitor where the cursor currently is
            if (isMacintosh) {
                const cursorPoint = screen.getCursorScreenPoint();
                displayToUse = screen.getDisplayNearestPoint(cursorPoint);
            }
            // if we have a last active window, use that display for the new window
            if (!displayToUse && parentWindow) {
                displayToUse = screen.getDisplayMatching(parentWindow.getBounds());
            }
            // fallback to primary display or first display
            if (!displayToUse) {
                displayToUse = screen.getPrimaryDisplay() || displays[0];
            }
        }
        const displayBounds = displayToUse.bounds;
        const state = {
            width: defaultWidth,
            height: defaultHeight,
            x: displayBounds.x + (displayBounds.width / 2) - (defaultWidth / 2),
            y: displayBounds.y + (displayBounds.height / 2) - (defaultHeight / 2)
        };
        if (displayBounds.width > 0 && displayBounds.height > 0 /* Linux X11 sessions sometimes report wrong display bounds */) {
            if (state.x < displayBounds.x) {
                state.x = displayBounds.x; // prevent window from falling out of the screen to the left
            }
            if (state.y < displayBounds.y) {
                state.y = displayBounds.y; // prevent window from falling out of the screen to the top
            }
            if (state.x > (displayBounds.x + displayBounds.width)) {
                state.x = displayBounds.x; // prevent window from falling out of the screen to the right
            }
            if (state.y > (displayBounds.y + displayBounds.height)) {
                state.y = displayBounds.y; // prevent window from falling out of the screen to the bottom
            }
            if (state.width > displayBounds.width) {
                state.width = displayBounds.width; // prevent window from exceeding display bounds width
            }
            if (state.height > displayBounds.height) {
                state.height = displayBounds.height; // prevent window from exceeding display bounds height
            }
        }
        return state;
    }
};
IssueMainService = IssueMainService_1 = __decorate([
    __param(1, IEnvironmentMainService),
    __param(2, ILogService),
    __param(3, IDialogMainService),
    __param(4, INativeHostMainService),
    __param(5, IProtocolMainService),
    __param(6, IWindowsMainService),
    __param(7, ICSSDevelopmentService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object])
], IssueMainService);
export { IssueMainService };
