import './style.js';
import { runWhenWindowIdle } from '../../base/browser/dom.js';
import { Event, Emitter, setGlobalLeakWarningThreshold } from '../../base/common/event.js';
import { RunOnceScheduler, timeout } from '../../base/common/async.js';
import { isFirefox, isSafari, isChrome } from '../../base/browser/browser.js';
import { mark } from '../../base/common/performance.js';
import { onUnexpectedError, setUnexpectedErrorHandler } from '../../base/common/errors.js';
import { Registry } from '../../platform/registry/common/platform.js';
import { isWindows, isLinux, isWeb, isNative, isMacintosh } from '../../base/common/platform.js';
import { Extensions as WorkbenchExtensions } from '../common/contributions.js';
import { EditorExtensions } from '../common/editor.js';
import { getSingletonServiceDescriptors } from '../../platform/instantiation/common/extensions.js';
import { IWorkbenchLayoutService, positionToString } from '../services/layout/browser/layoutService.js';
import { IStorageService, WillSaveStateReason } from '../../platform/storage/common/storage.js';
import { IConfigurationService } from '../../platform/configuration/common/configuration.js';
import { ILifecycleService } from '../services/lifecycle/common/lifecycle.js';
import { INotificationService } from '../../platform/notification/common/notification.js';
import { NotificationsCenter } from './parts/notifications/notificationsCenter.js';
import { NotificationsAlerts } from './parts/notifications/notificationsAlerts.js';
import { NotificationsStatus } from './parts/notifications/notificationsStatus.js';
import { NotificationsTelemetry } from './parts/notifications/notificationsTelemetry.js';
import { registerNotificationCommands } from './parts/notifications/notificationsCommands.js';
import { NotificationsToasts } from './parts/notifications/notificationsToasts.js';
import { setARIAContainer } from '../../base/browser/ui/aria/aria.js';
import { FontMeasurements } from '../../editor/browser/config/fontMeasurements.js';
import { BareFontInfo } from '../../editor/common/config/fontInfo.js';
import { toErrorMessage } from '../../base/common/errorMessage.js';
import { WorkbenchContextKeysHandler } from './contextkeys.js';
import { coalesce } from '../../base/common/arrays.js';
import { InstantiationService } from '../../platform/instantiation/common/instantiationService.js';
import { Layout } from './layout.js';
import { IHostService } from '../services/host/browser/host.js';
import { IDialogService } from '../../platform/dialogs/common/dialogs.js';
import { mainWindow } from '../../base/browser/window.js';
import { PixelRatio } from '../../base/browser/pixelRatio.js';
import { IHoverService, WorkbenchHoverDelegate } from '../../platform/hover/browser/hover.js';
import { setHoverDelegateFactory } from '../../base/browser/ui/hover/hoverDelegateFactory.js';
import { setBaseLayerHoverDelegate } from '../../base/browser/ui/hover/hoverDelegate2.js';
import { AccessibilityProgressSignalScheduler } from '../../platform/accessibilitySignal/browser/progressAccessibilitySignalScheduler.js';
import { setProgressAcccessibilitySignalScheduler } from '../../base/browser/ui/progressbar/progressAccessibilitySignal.js';
import { AccessibleViewRegistry } from '../../platform/accessibility/browser/accessibleViewRegistry.js';
import { NotificationAccessibleView } from './parts/notifications/notificationAccessibleView.js';
export class Workbench extends Layout {
    constructor(parent, options, serviceCollection, logService) {
        super(parent);
        this.options = options;
        this.serviceCollection = serviceCollection;
        this._onWillShutdown = this._register(new Emitter());
        this.onWillShutdown = this._onWillShutdown.event;
        this._onDidShutdown = this._register(new Emitter());
        this.onDidShutdown = this._onDidShutdown.event;
        this.previousUnexpectedError = { message: undefined, time: 0 };
        mark('code/willStartWorkbench');
        this.registerErrorHandler(logService);
    }
    registerErrorHandler(logService) {
        mainWindow.addEventListener('unhandledrejection', (event) => {
            onUnexpectedError(event.reason);
            event.preventDefault();
        });
        setUnexpectedErrorHandler(error => this.handleUnexpectedError(error, logService));
    }
    handleUnexpectedError(error, logService) {
        const message = toErrorMessage(error, true);
        if (!message) {
            return;
        }
        const now = Date.now();
        if (message === this.previousUnexpectedError.message && now - this.previousUnexpectedError.time <= 1000) {
            return;
        }
        this.previousUnexpectedError.time = now;
        this.previousUnexpectedError.message = message;
        logService.error(message);
    }
    startup() {
        try {
            this._register(setGlobalLeakWarningThreshold(175));
            const instantiationService = this.initServices(this.serviceCollection);
            instantiationService.invokeFunction(accessor => {
                const lifecycleService = accessor.get(ILifecycleService);
                const storageService = accessor.get(IStorageService);
                const configurationService = accessor.get(IConfigurationService);
                const hostService = accessor.get(IHostService);
                const hoverService = accessor.get(IHoverService);
                const dialogService = accessor.get(IDialogService);
                const notificationService = accessor.get(INotificationService);
                setHoverDelegateFactory((placement, enableInstantHover) => instantiationService.createInstance(WorkbenchHoverDelegate, placement, enableInstantHover, {}));
                setBaseLayerHoverDelegate(hoverService);
                this.initLayout(accessor);
                Registry.as(WorkbenchExtensions.Workbench).start(accessor);
                Registry.as(EditorExtensions.EditorFactory).start(accessor);
                this._register(instantiationService.createInstance(WorkbenchContextKeysHandler));
                this.registerListeners(lifecycleService, storageService, configurationService, hostService, dialogService);
                this.renderWorkbench(instantiationService, notificationService, storageService, configurationService);
                this.createWorkbenchLayout();
                this.layout();
                this.restore(lifecycleService);
            });
            return instantiationService;
        }
        catch (error) {
            onUnexpectedError(error);
            throw error;
        }
    }
    initServices(serviceCollection) {
        serviceCollection.set(IWorkbenchLayoutService, this);
        const contributedServices = getSingletonServiceDescriptors();
        for (const [id, descriptor] of contributedServices) {
            serviceCollection.set(id, descriptor);
        }
        const instantiationService = new InstantiationService(serviceCollection, true);
        instantiationService.invokeFunction(accessor => {
            const lifecycleService = accessor.get(ILifecycleService);
            const configurationService = accessor.get(IConfigurationService);
            if (typeof configurationService.acquireInstantiationService === 'function') {
                configurationService.acquireInstantiationService(instantiationService);
            }
            lifecycleService.phase = 2;
        });
        return instantiationService;
    }
    registerListeners(lifecycleService, storageService, configurationService, hostService, dialogService) {
        this._register(configurationService.onDidChangeConfiguration(e => this.updateFontAliasing(e, configurationService)));
        if (isNative) {
            this._register(storageService.onWillSaveState(e => {
                if (e.reason === WillSaveStateReason.SHUTDOWN) {
                    this.storeFontInfo(storageService);
                }
            }));
        }
        else {
            this._register(lifecycleService.onWillShutdown(() => this.storeFontInfo(storageService)));
        }
        this._register(lifecycleService.onWillShutdown(event => this._onWillShutdown.fire(event)));
        this._register(lifecycleService.onDidShutdown(() => {
            this._onDidShutdown.fire();
            this.dispose();
        }));
        this._register(hostService.onDidChangeFocus(focus => {
            if (!focus) {
                storageService.flush();
            }
        }));
        this._register(dialogService.onWillShowDialog(() => this.mainContainer.classList.add('modal-dialog-visible')));
        this._register(dialogService.onDidShowDialog(() => this.mainContainer.classList.remove('modal-dialog-visible')));
    }
    updateFontAliasing(e, configurationService) {
        if (!isMacintosh) {
            return;
        }
        if (e && !e.affectsConfiguration('workbench.fontAliasing')) {
            return;
        }
        const aliasing = configurationService.getValue('workbench.fontAliasing');
        if (this.fontAliasing === aliasing) {
            return;
        }
        this.fontAliasing = aliasing;
        const fontAliasingValues = ['antialiased', 'none', 'auto'];
        this.mainContainer.classList.remove(...fontAliasingValues.map(value => `monaco-font-aliasing-${value}`));
        if (fontAliasingValues.some(option => option === aliasing)) {
            this.mainContainer.classList.add(`monaco-font-aliasing-${aliasing}`);
        }
    }
    restoreFontInfo(storageService, configurationService) {
        const storedFontInfoRaw = storageService.get('editorFontInfo', -1);
        if (storedFontInfoRaw) {
            try {
                const storedFontInfo = JSON.parse(storedFontInfoRaw);
                if (Array.isArray(storedFontInfo)) {
                    FontMeasurements.restoreFontInfo(mainWindow, storedFontInfo);
                }
            }
            catch (err) {
            }
        }
        FontMeasurements.readFontInfo(mainWindow, BareFontInfo.createFromRawSettings(configurationService.getValue('editor'), PixelRatio.getInstance(mainWindow).value));
    }
    storeFontInfo(storageService) {
        const serializedFontInfo = FontMeasurements.serializeFontInfo(mainWindow);
        if (serializedFontInfo) {
            storageService.store('editorFontInfo', JSON.stringify(serializedFontInfo), -1, 1);
        }
    }
    renderWorkbench(instantiationService, notificationService, storageService, configurationService) {
        setARIAContainer(this.mainContainer);
        setProgressAcccessibilitySignalScheduler((msDelayTime, msLoopTime) => instantiationService.createInstance(AccessibilityProgressSignalScheduler, msDelayTime, msLoopTime));
        const platformClass = isWindows ? 'windows' : isLinux ? 'linux' : 'mac';
        const workbenchClasses = coalesce([
            'monaco-workbench',
            platformClass,
            isWeb ? 'web' : undefined,
            isChrome ? 'chromium' : isFirefox ? 'firefox' : isSafari ? 'safari' : undefined,
            ...this.getLayoutClasses(),
            ...(this.options?.extraClasses ? this.options.extraClasses : [])
        ]);
        this.mainContainer.classList.add(...workbenchClasses);
        mainWindow.document.body.classList.add(platformClass);
        if (isWeb) {
            mainWindow.document.body.classList.add('web');
        }
        this.updateFontAliasing(undefined, configurationService);
        this.restoreFontInfo(storageService, configurationService);
        for (const { id, role, classes, options } of [
            { id: "workbench.parts.titlebar", role: 'none', classes: ['titlebar'] },
            { id: "workbench.parts.banner", role: 'banner', classes: ['banner'] },
            { id: "workbench.parts.activitybar", role: 'none', classes: ['activitybar', this.getSideBarPosition() === 0 ? 'left' : 'right'] },
            { id: "workbench.parts.sidebar", role: 'none', classes: ['sidebar', this.getSideBarPosition() === 0 ? 'left' : 'right'] },
            { id: "workbench.parts.editor", role: 'main', classes: ['editor'], options: { restorePreviousState: this.willRestoreEditors() } },
            { id: "workbench.parts.panel", role: 'none', classes: ['panel', 'basepanel', positionToString(this.getPanelPosition())] },
            { id: "workbench.parts.auxiliarybar", role: 'none', classes: ['auxiliarybar', 'basepanel', this.getSideBarPosition() === 0 ? 'right' : 'left'] },
            { id: "workbench.parts.statusbar", role: 'status', classes: ['statusbar'] }
        ]) {
            const partContainer = this.createPart(id, role, classes);
            mark(`code/willCreatePart/${id}`);
            this.getPart(id).create(partContainer, options);
            mark(`code/didCreatePart/${id}`);
        }
        this.createNotificationsHandlers(instantiationService, notificationService);
        this.parent.appendChild(this.mainContainer);
    }
    createPart(id, role, classes) {
        const part = document.createElement(role === 'status' ? 'footer' : 'div');
        part.classList.add('part', ...classes);
        part.id = id;
        part.setAttribute('role', role);
        if (role === 'status') {
            part.setAttribute('aria-live', 'off');
        }
        return part;
    }
    createNotificationsHandlers(instantiationService, notificationService) {
        const notificationsCenter = this._register(instantiationService.createInstance(NotificationsCenter, this.mainContainer, notificationService.model));
        const notificationsToasts = this._register(instantiationService.createInstance(NotificationsToasts, this.mainContainer, notificationService.model));
        this._register(instantiationService.createInstance(NotificationsAlerts, notificationService.model));
        const notificationsStatus = instantiationService.createInstance(NotificationsStatus, notificationService.model);
        this._register(instantiationService.createInstance(NotificationsTelemetry));
        this._register(notificationsCenter.onDidChangeVisibility(() => {
            notificationsStatus.update(notificationsCenter.isVisible, notificationsToasts.isVisible);
            notificationsToasts.update(notificationsCenter.isVisible);
        }));
        this._register(notificationsToasts.onDidChangeVisibility(() => {
            notificationsStatus.update(notificationsCenter.isVisible, notificationsToasts.isVisible);
        }));
        registerNotificationCommands(notificationsCenter, notificationsToasts, notificationService.model);
        AccessibleViewRegistry.register(new NotificationAccessibleView());
        this.registerNotifications({
            onDidChangeNotificationsVisibility: Event.map(Event.any(notificationsToasts.onDidChangeVisibility, notificationsCenter.onDidChangeVisibility), () => notificationsToasts.isVisible || notificationsCenter.isVisible)
        });
    }
    restore(lifecycleService) {
        try {
            this.restoreParts();
        }
        catch (error) {
            onUnexpectedError(error);
        }
        this.whenReady.finally(() => Promise.race([
            this.whenRestored,
            timeout(2000)
        ]).finally(() => {
            function markDidStartWorkbench() {
                mark('code/didStartWorkbench');
                performance.measure('perf: workbench create & restore', 'code/didLoadWorkbenchMain', 'code/didStartWorkbench');
            }
            if (this.isRestored()) {
                markDidStartWorkbench();
            }
            else {
                this.whenRestored.finally(() => markDidStartWorkbench());
            }
            lifecycleService.phase = 3;
            const eventuallyPhaseScheduler = this._register(new RunOnceScheduler(() => {
                this._register(runWhenWindowIdle(mainWindow, () => lifecycleService.phase = 4, 2500));
            }, 2500));
            eventuallyPhaseScheduler.schedule();
        }));
    }
}
