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
var BaseWindow_1;
import { isSafari, setFullscreen } from '../../base/browser/browser.js';
import { addDisposableListener, EventHelper, EventType, getActiveWindow, getWindow, getWindowById, getWindows, getWindowsCount, windowOpenNoOpener, windowOpenPopup, windowOpenWithSuccess } from '../../base/browser/dom.js';
import { DomEmitter } from '../../base/browser/event.js';
import { requestHidDevice, requestSerialPort, requestUsbDevice } from '../../base/browser/deviceAccess.js';
import { timeout } from '../../base/common/async.js';
import { Event } from '../../base/common/event.js';
import { Disposable, dispose, toDisposable } from '../../base/common/lifecycle.js';
import { matchesScheme, Schemas } from '../../base/common/network.js';
import { isIOS, isMacintosh } from '../../base/common/platform.js';
import Severity from '../../base/common/severity.js';
import { URI } from '../../base/common/uri.js';
import { localize } from '../../nls.js';
import { CommandsRegistry } from '../../platform/commands/common/commands.js';
import { IDialogService } from '../../platform/dialogs/common/dialogs.js';
import { IInstantiationService } from '../../platform/instantiation/common/instantiation.js';
import { ILabelService } from '../../platform/label/common/label.js';
import { IOpenerService } from '../../platform/opener/common/opener.js';
import { IProductService } from '../../platform/product/common/productService.js';
import { IBrowserWorkbenchEnvironmentService } from '../services/environment/browser/environmentService.js';
import { IWorkbenchLayoutService } from '../services/layout/browser/layoutService.js';
import { BrowserLifecycleService } from '../services/lifecycle/browser/lifecycleService.js';
import { ILifecycleService } from '../services/lifecycle/common/lifecycle.js';
import { IHostService } from '../services/host/browser/host.js';
import { registerWindowDriver } from '../services/driver/browser/driver.js';
import { isAuxiliaryWindow, mainWindow } from '../../base/browser/window.js';
import { createSingleCallFunction } from '../../base/common/functional.js';
import { IConfigurationService } from '../../platform/configuration/common/configuration.js';
import { IWorkbenchEnvironmentService } from '../services/environment/common/environmentService.js';
let BaseWindow = class BaseWindow extends Disposable {
    static { BaseWindow_1 = this; }
    static { this.TIMEOUT_HANDLES = Number.MIN_SAFE_INTEGER; } // try to not compete with the IDs of native `setTimeout`
    static { this.TIMEOUT_DISPOSABLES = new Map(); }
    constructor(targetWindow, dom = { getWindowsCount, getWindows }, hostService, environmentService) {
        super();
        this.hostService = hostService;
        this.environmentService = environmentService;
        this.enableWindowFocusOnElementFocus(targetWindow);
        this.enableMultiWindowAwareTimeout(targetWindow, dom);
        this.registerFullScreenListeners(targetWindow.vscodeWindowId);
    }
    //#region focus handling in multi-window applications
    enableWindowFocusOnElementFocus(targetWindow) {
        const originalFocus = targetWindow.HTMLElement.prototype.focus;
        const that = this;
        targetWindow.HTMLElement.prototype.focus = function (options) {
            // Ensure the window the element belongs to is focused
            // in scenarios where auxiliary windows are present
            that.onElementFocus(getWindow(this));
            // Pass to original focus() method
            originalFocus.apply(this, [options]);
        };
    }
    onElementFocus(targetWindow) {
        const activeWindow = getActiveWindow();
        if (activeWindow !== targetWindow && activeWindow.document.hasFocus()) {
            // Call original focus()
            targetWindow.focus();
            // In Electron, `window.focus()` fails to bring the window
            // to the front if multiple windows exist in the same process
            // group (floating windows). As such, we ask the host service
            // to focus the window which can take care of bringin the
            // window to the front.
            //
            // To minimise disruption by bringing windows to the front
            // by accident, we only do this if the window is not already
            // focused and the active window is not the target window
            // but has focus. This is an indication that multiple windows
            // are opened in the same process group while the target window
            // is not focused.
            if (!this.environmentService.extensionTestsLocationURI &&
                !targetWindow.document.hasFocus()) {
                this.hostService.focus(targetWindow);
            }
        }
    }
    //#endregion
    //#region timeout handling in multi-window applications
    enableMultiWindowAwareTimeout(targetWindow, dom = { getWindowsCount, getWindows }) {
        // Override `setTimeout` and `clearTimeout` on the provided window to make
        // sure timeouts are dispatched to all opened windows. Some browsers may decide
        // to throttle timeouts in minimized windows, so with this we can ensure the
        // timeout is scheduled without being throttled (unless all windows are minimized).
        const originalSetTimeout = targetWindow.setTimeout;
        Object.defineProperty(targetWindow, 'vscodeOriginalSetTimeout', { get: () => originalSetTimeout });
        const originalClearTimeout = targetWindow.clearTimeout;
        Object.defineProperty(targetWindow, 'vscodeOriginalClearTimeout', { get: () => originalClearTimeout });
        targetWindow.setTimeout = function (handler, timeout = 0, ...args) {
            if (dom.getWindowsCount() === 1 || typeof handler === 'string' || timeout === 0 /* immediates are never throttled */) {
                return originalSetTimeout.apply(this, [handler, timeout, ...args]);
            }
            const timeoutDisposables = new Set();
            const timeoutHandle = BaseWindow_1.TIMEOUT_HANDLES++;
            BaseWindow_1.TIMEOUT_DISPOSABLES.set(timeoutHandle, timeoutDisposables);
            const handlerFn = createSingleCallFunction(handler, () => {
                dispose(timeoutDisposables);
                BaseWindow_1.TIMEOUT_DISPOSABLES.delete(timeoutHandle);
            });
            for (const { window, disposables } of dom.getWindows()) {
                if (isAuxiliaryWindow(window) && window.document.visibilityState === 'hidden') {
                    continue; // skip over hidden windows (but never over main window)
                }
                // we track didClear in case the browser does not properly clear the timeout
                // this can happen for timeouts on unfocused windows
                let didClear = false;
                const handle = window.vscodeOriginalSetTimeout.apply(this, [(...args) => {
                        if (didClear) {
                            return;
                        }
                        handlerFn(...args);
                    }, timeout, ...args]);
                const timeoutDisposable = toDisposable(() => {
                    didClear = true;
                    window.vscodeOriginalClearTimeout(handle);
                    timeoutDisposables.delete(timeoutDisposable);
                });
                disposables.add(timeoutDisposable);
                timeoutDisposables.add(timeoutDisposable);
            }
            return timeoutHandle;
        };
        targetWindow.clearTimeout = function (timeoutHandle) {
            const timeoutDisposables = typeof timeoutHandle === 'number' ? BaseWindow_1.TIMEOUT_DISPOSABLES.get(timeoutHandle) : undefined;
            if (timeoutDisposables) {
                dispose(timeoutDisposables);
                BaseWindow_1.TIMEOUT_DISPOSABLES.delete(timeoutHandle);
            }
            else {
                originalClearTimeout.apply(this, [timeoutHandle]);
            }
        };
    }
    //#endregion
    registerFullScreenListeners(targetWindowId) {
        this._register(this.hostService.onDidChangeFullScreen(({ windowId, fullscreen }) => {
            if (windowId === targetWindowId) {
                const targetWindow = getWindowById(targetWindowId);
                if (targetWindow) {
                    setFullscreen(fullscreen, targetWindow.window);
                }
            }
        }));
    }
    //#region Confirm on Shutdown
    static async confirmOnShutdown(accessor, reason) {
        const dialogService = accessor.get(IDialogService);
        const configurationService = accessor.get(IConfigurationService);
        const message = reason === 2 /* ShutdownReason.QUIT */ ?
            (isMacintosh ? localize('quitMessageMac', "Are you sure you want to quit?") : localize('quitMessage', "Are you sure you want to exit?")) :
            localize('closeWindowMessage', "Are you sure you want to close the window?");
        const primaryButton = reason === 2 /* ShutdownReason.QUIT */ ?
            (isMacintosh ? localize({ key: 'quitButtonLabel', comment: ['&& denotes a mnemonic'] }, "&&Quit") : localize({ key: 'exitButtonLabel', comment: ['&& denotes a mnemonic'] }, "&&Exit")) :
            localize({ key: 'closeWindowButtonLabel', comment: ['&& denotes a mnemonic'] }, "&&Close Window");
        const res = await dialogService.confirm({
            message,
            primaryButton,
            checkbox: {
                label: localize('doNotAskAgain', "Do not ask me again")
            }
        });
        // Update setting if checkbox checked
        if (res.confirmed && res.checkboxChecked) {
            await configurationService.updateValue('window.confirmBeforeClose', 'never');
        }
        return res.confirmed;
    }
};
BaseWindow = BaseWindow_1 = __decorate([
    __param(2, IHostService),
    __param(3, IWorkbenchEnvironmentService),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], BaseWindow);
export { BaseWindow };
let BrowserWindow = class BrowserWindow extends BaseWindow {
    constructor(openerService, lifecycleService, dialogService, labelService, productService, browserEnvironmentService, layoutService, instantiationService, hostService) {
        super(mainWindow, undefined, hostService, browserEnvironmentService);
        this.openerService = openerService;
        this.lifecycleService = lifecycleService;
        this.dialogService = dialogService;
        this.labelService = labelService;
        this.productService = productService;
        this.browserEnvironmentService = browserEnvironmentService;
        this.layoutService = layoutService;
        this.instantiationService = instantiationService;
        this.registerListeners();
        this.create();
    }
    registerListeners() {
        // Lifecycle
        this._register(this.lifecycleService.onWillShutdown(() => this.onWillShutdown()));
        // Layout
        const viewport = isIOS && mainWindow.visualViewport ? mainWindow.visualViewport /** Visual viewport */ : mainWindow /** Layout viewport */;
        this._register(addDisposableListener(viewport, EventType.RESIZE, () => {
            this.layoutService.layout();
            // Sometimes the keyboard appearing scrolls the whole workbench out of view, as a workaround scroll back into view #121206
            if (isIOS) {
                mainWindow.scrollTo(0, 0);
            }
        }));
        // Prevent the back/forward gestures in macOS
        this._register(addDisposableListener(this.layoutService.mainContainer, EventType.WHEEL, e => e.preventDefault(), { passive: false }));
        // Prevent native context menus in web
        this._register(addDisposableListener(this.layoutService.mainContainer, EventType.CONTEXT_MENU, e => EventHelper.stop(e, true)));
        // Prevent default navigation on drop
        this._register(addDisposableListener(this.layoutService.mainContainer, EventType.DROP, e => EventHelper.stop(e, true)));
    }
    onWillShutdown() {
        // Try to detect some user interaction with the workbench
        // when shutdown has happened to not show the dialog e.g.
        // when navigation takes a longer time.
        Event.toPromise(Event.any(Event.once(new DomEmitter(mainWindow.document.body, EventType.KEY_DOWN, true).event), Event.once(new DomEmitter(mainWindow.document.body, EventType.MOUSE_DOWN, true).event))).then(async () => {
            // Delay the dialog in case the user interacted
            // with the page before it transitioned away
            await timeout(3000);
            // This should normally not happen, but if for some reason
            // the workbench was shutdown while the page is still there,
            // inform the user that only a reload can bring back a working
            // state.
            await this.dialogService.prompt({
                type: Severity.Error,
                message: localize('shutdownError', "An unexpected error occurred that requires a reload of this page."),
                detail: localize('shutdownErrorDetail', "The workbench was unexpectedly disposed while running."),
                buttons: [
                    {
                        label: localize({ key: 'reload', comment: ['&& denotes a mnemonic'] }, "&&Reload"),
                        run: () => mainWindow.location.reload() // do not use any services at this point since they are likely not functional at this point
                    }
                ]
            });
        });
    }
    create() {
        // Handle open calls
        this.setupOpenHandlers();
        // Label formatting
        this.registerLabelFormatters();
        // Commands
        this.registerCommands();
        // Smoke Test Driver
        this.setupDriver();
    }
    setupDriver() {
        if (this.environmentService.enableSmokeTestDriver) {
            registerWindowDriver(this.instantiationService);
        }
    }
    setupOpenHandlers() {
        // We need to ignore the `beforeunload` event while
        // we handle external links to open specifically for
        // the case of application protocols that e.g. invoke
        // vscode itself. We do not want to open these links
        // in a new window because that would leave a blank
        // window to the user, but using `window.location.href`
        // will trigger the `beforeunload`.
        this.openerService.setDefaultExternalOpener({
            openExternal: async (href) => {
                let isAllowedOpener = false;
                if (this.browserEnvironmentService.options?.openerAllowedExternalUrlPrefixes) {
                    for (const trustedPopupPrefix of this.browserEnvironmentService.options.openerAllowedExternalUrlPrefixes) {
                        if (href.startsWith(trustedPopupPrefix)) {
                            isAllowedOpener = true;
                            break;
                        }
                    }
                }
                // HTTP(s): open in new window and deal with potential popup blockers
                if (matchesScheme(href, Schemas.http) || matchesScheme(href, Schemas.https)) {
                    if (isSafari) {
                        const opened = windowOpenWithSuccess(href, !isAllowedOpener);
                        if (!opened) {
                            await this.dialogService.prompt({
                                type: Severity.Warning,
                                message: localize('unableToOpenExternal', "The browser interrupted the opening of a new tab or window. Press 'Open' to open it anyway."),
                                detail: href,
                                buttons: [
                                    {
                                        label: localize({ key: 'open', comment: ['&& denotes a mnemonic'] }, "&&Open"),
                                        run: () => isAllowedOpener ? windowOpenPopup(href) : windowOpenNoOpener(href)
                                    },
                                    {
                                        label: localize({ key: 'learnMore', comment: ['&& denotes a mnemonic'] }, "&&Learn More"),
                                        run: () => this.openerService.open(URI.parse('https://aka.ms/allow-vscode-popup'))
                                    }
                                ],
                                cancelButton: true
                            });
                        }
                    }
                    else {
                        isAllowedOpener
                            ? windowOpenPopup(href)
                            : windowOpenNoOpener(href);
                    }
                }
                // Anything else: set location to trigger protocol handler in the browser
                // but make sure to signal this as an expected unload and disable unload
                // handling explicitly to prevent the workbench from going down.
                else {
                    const invokeProtocolHandler = () => {
                        this.lifecycleService.withExpectedShutdown({ disableShutdownHandling: true }, () => mainWindow.location.href = href);
                    };
                    invokeProtocolHandler();
                    const showProtocolUrlOpenedDialog = async () => {
                        const { downloadUrl } = this.productService;
                        let detail;
                        const buttons = [
                            {
                                label: localize({ key: 'openExternalDialogButtonRetry.v2', comment: ['&& denotes a mnemonic'] }, "&&Try Again"),
                                run: () => invokeProtocolHandler()
                            }
                        ];
                        if (downloadUrl !== undefined) {
                            detail = localize('openExternalDialogDetail.v2', "We launched {0} on your computer.\n\nIf {1} did not launch, try again or install it below.", this.productService.nameLong, this.productService.nameLong);
                            buttons.push({
                                label: localize({ key: 'openExternalDialogButtonInstall.v3', comment: ['&& denotes a mnemonic'] }, "&&Install"),
                                run: async () => {
                                    await this.openerService.open(URI.parse(downloadUrl));
                                    // Re-show the dialog so that the user can come back after installing and try again
                                    showProtocolUrlOpenedDialog();
                                }
                            });
                        }
                        else {
                            detail = localize('openExternalDialogDetailNoInstall', "We launched {0} on your computer.\n\nIf {1} did not launch, try again below.", this.productService.nameLong, this.productService.nameLong);
                        }
                        // While this dialog shows, closing the tab will not display a confirmation dialog
                        // to avoid showing the user two dialogs at once
                        await this.hostService.withExpectedShutdown(() => this.dialogService.prompt({
                            type: Severity.Info,
                            message: localize('openExternalDialogTitle', "All done. You can close this tab now."),
                            detail,
                            buttons,
                            cancelButton: true
                        }));
                    };
                    // We cannot know whether the protocol handler succeeded.
                    // Display guidance in case it did not, e.g. the app is not installed locally.
                    if (matchesScheme(href, this.productService.urlProtocol)) {
                        await showProtocolUrlOpenedDialog();
                    }
                }
                return true;
            }
        });
    }
    registerLabelFormatters() {
        this._register(this.labelService.registerFormatter({
            scheme: Schemas.vscodeUserData,
            priority: true,
            formatting: {
                label: '(Settings) ${path}',
                separator: '/',
            }
        }));
    }
    registerCommands() {
        // Allow extensions to request USB devices in Web
        CommandsRegistry.registerCommand('workbench.experimental.requestUsbDevice', async (_accessor, options) => {
            return requestUsbDevice(options);
        });
        // Allow extensions to request Serial devices in Web
        CommandsRegistry.registerCommand('workbench.experimental.requestSerialPort', async (_accessor, options) => {
            return requestSerialPort(options);
        });
        // Allow extensions to request HID devices in Web
        CommandsRegistry.registerCommand('workbench.experimental.requestHidDevice', async (_accessor, options) => {
            return requestHidDevice(options);
        });
    }
};
BrowserWindow = __decorate([
    __param(0, IOpenerService),
    __param(1, ILifecycleService),
    __param(2, IDialogService),
    __param(3, ILabelService),
    __param(4, IProductService),
    __param(5, IBrowserWorkbenchEnvironmentService),
    __param(6, IWorkbenchLayoutService),
    __param(7, IInstantiationService),
    __param(8, IHostService),
    __metadata("design:paramtypes", [Object, BrowserLifecycleService, Object, Object, Object, Object, Object, Object, Object])
], BrowserWindow);
export { BrowserWindow };
