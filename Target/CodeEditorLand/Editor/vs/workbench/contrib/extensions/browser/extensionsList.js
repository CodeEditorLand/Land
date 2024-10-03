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
import './media/extension.css';
import { append, $, addDisposableListener } from '../../../../base/browser/dom.js';
import { dispose, combinedDisposable } from '../../../../base/common/lifecycle.js';
import { ActionBar } from '../../../../base/browser/ui/actionbar/actionbar.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { Event } from '../../../../base/common/event.js';
import { ExtensionContainers, IExtensionsWorkbenchService } from '../common/extensions.js';
import { ManageExtensionAction, ExtensionRuntimeStateAction, ExtensionStatusLabelAction, RemoteInstallAction, ExtensionStatusAction, LocalInstallAction, ButtonWithDropDownExtensionAction, InstallDropdownAction, InstallingLabelAction, ButtonWithDropdownExtensionActionViewItem, DropDownExtensionAction, WebInstallAction, MigrateDeprecatedExtensionAction, SetLanguageAction, ClearLanguageAction, UpdateAction } from './extensionsActions.js';
import { areSameExtensions } from '../../../../platform/extensionManagement/common/extensionManagementUtil.js';
import { RatingsWidget, InstallCountWidget, RecommendationWidget, RemoteBadgeWidget, ExtensionPackCountWidget as ExtensionPackBadgeWidget, SyncIgnoredWidget, ExtensionHoverWidget, ExtensionActivationStatusWidget, PreReleaseBookmarkWidget, extensionVerifiedPublisherIconColor, VerifiedPublisherWidget } from './extensionsWidgets.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
import { IWorkbenchExtensionEnablementService } from '../../../services/extensionManagement/common/extensionManagement.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { registerThemingParticipant } from '../../../../platform/theme/common/themeService.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { WORKBENCH_BACKGROUND } from '../../../common/theme.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { verifiedPublisherIcon as verifiedPublisherThemeIcon } from './extensionsIcons.js';
const EXTENSION_LIST_ELEMENT_HEIGHT = 72;
export class Delegate {
    getHeight() { return EXTENSION_LIST_ELEMENT_HEIGHT; }
    getTemplateId() { return 'extension'; }
}
let Renderer = class Renderer {
    constructor(extensionViewState, options, instantiationService, notificationService, extensionService, extensionsWorkbenchService, extensionEnablementService, contextMenuService) {
        this.extensionViewState = extensionViewState;
        this.options = options;
        this.instantiationService = instantiationService;
        this.notificationService = notificationService;
        this.extensionService = extensionService;
        this.extensionsWorkbenchService = extensionsWorkbenchService;
        this.extensionEnablementService = extensionEnablementService;
        this.contextMenuService = contextMenuService;
    }
    get templateId() { return 'extension'; }
    renderTemplate(root) {
        const recommendationWidget = this.instantiationService.createInstance(RecommendationWidget, append(root, $('.extension-bookmark-container')));
        const preReleaseWidget = this.instantiationService.createInstance(PreReleaseBookmarkWidget, append(root, $('.extension-bookmark-container')));
        const element = append(root, $('.extension-list-item'));
        const iconContainer = append(element, $('.icon-container'));
        const icon = append(iconContainer, $('img.icon', { alt: '' }));
        const iconRemoteBadgeWidget = this.instantiationService.createInstance(RemoteBadgeWidget, iconContainer, false);
        const extensionPackBadgeWidget = this.instantiationService.createInstance(ExtensionPackBadgeWidget, iconContainer);
        const details = append(element, $('.details'));
        const headerContainer = append(details, $('.header-container'));
        const header = append(headerContainer, $('.header'));
        const name = append(header, $('span.name'));
        const installCount = append(header, $('span.install-count'));
        const ratings = append(header, $('span.ratings'));
        const syncIgnore = append(header, $('span.sync-ignored'));
        const activationStatus = append(header, $('span.activation-status'));
        const headerRemoteBadgeWidget = this.instantiationService.createInstance(RemoteBadgeWidget, header, false);
        const description = append(details, $('.description.ellipsis'));
        const footer = append(details, $('.footer'));
        const publisher = append(footer, $('.author.ellipsis'));
        const verifiedPublisherWidget = this.instantiationService.createInstance(VerifiedPublisherWidget, append(publisher, $(`.verified-publisher`)), true);
        const publisherDisplayName = append(publisher, $('.publisher-name.ellipsis'));
        const actionbar = new ActionBar(footer, {
            actionViewItemProvider: (action, options) => {
                if (action instanceof ButtonWithDropDownExtensionAction) {
                    return new ButtonWithDropdownExtensionActionViewItem(action, {
                        ...options,
                        icon: true,
                        label: true,
                        menuActionsOrProvider: { getActions: () => action.menuActions },
                        menuActionClassNames: action.menuActionClassNames
                    }, this.contextMenuService);
                }
                if (action instanceof DropDownExtensionAction) {
                    return action.createActionViewItem(options);
                }
                return undefined;
            },
            focusOnlyEnabledItems: true
        });
        actionbar.setFocusable(false);
        actionbar.onDidRun(({ error }) => error && this.notificationService.error(error));
        const extensionStatusIconAction = this.instantiationService.createInstance(ExtensionStatusAction);
        const actions = [
            this.instantiationService.createInstance(ExtensionStatusLabelAction),
            this.instantiationService.createInstance(MigrateDeprecatedExtensionAction, true),
            this.instantiationService.createInstance(ExtensionRuntimeStateAction),
            this.instantiationService.createInstance(UpdateAction, false),
            this.instantiationService.createInstance(InstallDropdownAction),
            this.instantiationService.createInstance(InstallingLabelAction),
            this.instantiationService.createInstance(SetLanguageAction),
            this.instantiationService.createInstance(ClearLanguageAction),
            this.instantiationService.createInstance(RemoteInstallAction, false),
            this.instantiationService.createInstance(LocalInstallAction),
            this.instantiationService.createInstance(WebInstallAction),
            extensionStatusIconAction,
            this.instantiationService.createInstance(ManageExtensionAction)
        ];
        const extensionHoverWidget = this.instantiationService.createInstance(ExtensionHoverWidget, { target: root, position: this.options.hoverOptions.position }, extensionStatusIconAction);
        const widgets = [
            recommendationWidget,
            preReleaseWidget,
            iconRemoteBadgeWidget,
            extensionPackBadgeWidget,
            headerRemoteBadgeWidget,
            verifiedPublisherWidget,
            extensionHoverWidget,
            this.instantiationService.createInstance(SyncIgnoredWidget, syncIgnore),
            this.instantiationService.createInstance(ExtensionActivationStatusWidget, activationStatus, true),
            this.instantiationService.createInstance(InstallCountWidget, installCount, true),
            this.instantiationService.createInstance(RatingsWidget, ratings, true),
        ];
        const extensionContainers = this.instantiationService.createInstance(ExtensionContainers, [...actions, ...widgets]);
        actionbar.push(actions, { icon: true, label: true });
        const disposable = combinedDisposable(...actions, ...widgets, actionbar, extensionContainers);
        return {
            root, element, icon, name, installCount, ratings, description, publisherDisplayName, disposables: [disposable], actionbar,
            extensionDisposables: [],
            set extension(extension) {
                extensionContainers.extension = extension;
            }
        };
    }
    renderPlaceholder(index, data) {
        data.element.classList.add('loading');
        data.root.removeAttribute('aria-label');
        data.root.removeAttribute('data-extension-id');
        data.extensionDisposables = dispose(data.extensionDisposables);
        data.icon.src = '';
        data.name.textContent = '';
        data.description.textContent = '';
        data.publisherDisplayName.textContent = '';
        data.installCount.style.display = 'none';
        data.ratings.style.display = 'none';
        data.extension = null;
    }
    renderElement(extension, index, data) {
        data.element.classList.remove('loading');
        data.root.setAttribute('data-extension-id', extension.identifier.id);
        if (extension.state !== 3 && !extension.server) {
            extension = this.extensionsWorkbenchService.local.filter(e => e.server === extension.server && areSameExtensions(e.identifier, extension.identifier))[0] || extension;
        }
        data.extensionDisposables = dispose(data.extensionDisposables);
        const updateEnablement = () => {
            const disabled = extension.state === 1 && extension.local && !this.extensionEnablementService.isEnabled(extension.local);
            const deprecated = !!extension.deprecationInfo;
            data.element.classList.toggle('deprecated', deprecated);
            data.root.classList.toggle('disabled', disabled);
        };
        updateEnablement();
        this.extensionService.onDidChangeExtensions(() => updateEnablement(), this, data.extensionDisposables);
        data.extensionDisposables.push(addDisposableListener(data.icon, 'error', () => data.icon.src = extension.iconUrlFallback, { once: true }));
        data.icon.src = extension.iconUrl;
        if (!data.icon.complete) {
            data.icon.style.visibility = 'hidden';
            data.icon.onload = () => data.icon.style.visibility = 'inherit';
        }
        else {
            data.icon.style.visibility = 'inherit';
        }
        data.name.textContent = extension.displayName;
        data.description.textContent = extension.description;
        const updatePublisher = () => {
            data.publisherDisplayName.textContent = !extension.resourceExtension && extension.local?.source !== 'resource' ? extension.publisherDisplayName : '';
        };
        updatePublisher();
        Event.filter(this.extensionsWorkbenchService.onChange, e => !!e && areSameExtensions(e.identifier, extension.identifier))(() => updatePublisher(), this, data.extensionDisposables);
        data.installCount.style.display = '';
        data.ratings.style.display = '';
        data.extension = extension;
        if (extension.gallery && extension.gallery.properties && extension.gallery.properties.localizedLanguages && extension.gallery.properties.localizedLanguages.length) {
            data.description.textContent = extension.gallery.properties.localizedLanguages.map(name => name[0].toLocaleUpperCase() + name.slice(1)).join(', ');
        }
        this.extensionViewState.onFocus(e => {
            if (areSameExtensions(extension.identifier, e.identifier)) {
                data.actionbar.setFocusable(true);
            }
        }, this, data.extensionDisposables);
        this.extensionViewState.onBlur(e => {
            if (areSameExtensions(extension.identifier, e.identifier)) {
                data.actionbar.setFocusable(false);
            }
        }, this, data.extensionDisposables);
    }
    disposeElement(extension, index, data) {
        data.extensionDisposables = dispose(data.extensionDisposables);
    }
    disposeTemplate(data) {
        data.extensionDisposables = dispose(data.extensionDisposables);
        data.disposables = dispose(data.disposables);
    }
};
Renderer = __decorate([
    __param(2, IInstantiationService),
    __param(3, INotificationService),
    __param(4, IExtensionService),
    __param(5, IExtensionsWorkbenchService),
    __param(6, IWorkbenchExtensionEnablementService),
    __param(7, IContextMenuService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object])
], Renderer);
export { Renderer };
registerThemingParticipant((theme, collector) => {
    const verifiedPublisherIconColor = theme.getColor(extensionVerifiedPublisherIconColor);
    if (verifiedPublisherIconColor) {
        const disabledVerifiedPublisherIconColor = verifiedPublisherIconColor.transparent(.5).makeOpaque(WORKBENCH_BACKGROUND(theme));
        collector.addRule(`.extensions-list .monaco-list .monaco-list-row.disabled:not(.selected) .author .verified-publisher ${ThemeIcon.asCSSSelector(verifiedPublisherThemeIcon)} { color: ${disabledVerifiedPublisherIconColor}; }`);
    }
});
