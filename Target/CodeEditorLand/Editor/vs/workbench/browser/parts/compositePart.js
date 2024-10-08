/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import './media/compositepart.css';
import { localize } from '../../../nls.js';
import { defaultGenerator } from '../../../base/common/idGenerator.js';
import { dispose, DisposableStore, MutableDisposable, } from '../../../base/common/lifecycle.js';
import { Emitter } from '../../../base/common/event.js';
import { isCancellationError } from '../../../base/common/errors.js';
import { prepareActions } from '../../../base/browser/ui/actionbar/actionbar.js';
import { ProgressBar } from '../../../base/browser/ui/progressbar/progressbar.js';
import { Part } from '../part.js';
import { ServiceCollection } from '../../../platform/instantiation/common/serviceCollection.js';
import { IEditorProgressService } from '../../../platform/progress/common/progress.js';
import { Dimension, append, $, hide, show } from '../../../base/browser/dom.js';
import { assertIsDefined } from '../../../base/common/types.js';
import { createActionViewItem } from '../../../platform/actions/browser/menuEntryActionViewItem.js';
import { AbstractProgressScope, ScopedProgressIndicator } from '../../services/progress/browser/progressIndicator.js';
import { WorkbenchToolBar } from '../../../platform/actions/browser/toolbar.js';
import { defaultProgressBarStyles } from '../../../platform/theme/browser/defaultStyles.js';
import { createInstantHoverDelegate, getDefaultHoverDelegate } from '../../../base/browser/ui/hover/hoverDelegateFactory.js';
export class CompositePart extends Part {
    constructor(notificationService, storageService, contextMenuService, layoutService, keybindingService, hoverService, instantiationService, themeService, registry, activeCompositeSettingsKey, defaultCompositeId, nameForTelemetry, compositeCSSClass, titleForegroundColor, id, options) {
        super(id, options, themeService, storageService, layoutService);
        this.notificationService = notificationService;
        this.storageService = storageService;
        this.contextMenuService = contextMenuService;
        this.keybindingService = keybindingService;
        this.hoverService = hoverService;
        this.instantiationService = instantiationService;
        this.registry = registry;
        this.activeCompositeSettingsKey = activeCompositeSettingsKey;
        this.defaultCompositeId = defaultCompositeId;
        this.nameForTelemetry = nameForTelemetry;
        this.compositeCSSClass = compositeCSSClass;
        this.titleForegroundColor = titleForegroundColor;
        this.onDidCompositeOpen = this._register(new Emitter());
        this.onDidCompositeClose = this._register(new Emitter());
        this.mapCompositeToCompositeContainer = new Map();
        this.mapActionsBindingToComposite = new Map();
        this.instantiatedCompositeItems = new Map();
        this.actionsListener = this._register(new MutableDisposable());
        this.lastActiveCompositeId = storageService.get(activeCompositeSettingsKey, 1 /* StorageScope.WORKSPACE */, this.defaultCompositeId);
        this.toolbarHoverDelegate = this._register(createInstantHoverDelegate());
    }
    openComposite(id, focus) {
        // Check if composite already visible and just focus in that case
        if (this.activeComposite?.getId() === id) {
            if (focus) {
                this.activeComposite.focus();
            }
            // Fullfill promise with composite that is being opened
            return this.activeComposite;
        }
        // We cannot open the composite if we have not been created yet
        if (!this.element) {
            return;
        }
        // Open
        return this.doOpenComposite(id, focus);
    }
    doOpenComposite(id, focus = false) {
        // Use a generated token to avoid race conditions from long running promises
        const currentCompositeOpenToken = defaultGenerator.nextId();
        this.currentCompositeOpenToken = currentCompositeOpenToken;
        // Hide current
        if (this.activeComposite) {
            this.hideActiveComposite();
        }
        // Update Title
        this.updateTitle(id);
        // Create composite
        const composite = this.createComposite(id, true);
        // Check if another composite opened meanwhile and return in that case
        if ((this.currentCompositeOpenToken !== currentCompositeOpenToken) || (this.activeComposite && this.activeComposite.getId() !== composite.getId())) {
            return undefined;
        }
        // Check if composite already visible and just focus in that case
        if (this.activeComposite?.getId() === composite.getId()) {
            if (focus) {
                composite.focus();
            }
            this.onDidCompositeOpen.fire({ composite, focus });
            return composite;
        }
        // Show Composite and Focus
        this.showComposite(composite);
        if (focus) {
            composite.focus();
        }
        // Return with the composite that is being opened
        if (composite) {
            this.onDidCompositeOpen.fire({ composite, focus });
        }
        return composite;
    }
    createComposite(id, isActive) {
        // Check if composite is already created
        const compositeItem = this.instantiatedCompositeItems.get(id);
        if (compositeItem) {
            return compositeItem.composite;
        }
        // Instantiate composite from registry otherwise
        const compositeDescriptor = this.registry.getComposite(id);
        if (compositeDescriptor) {
            const that = this;
            const compositeProgressIndicator = new ScopedProgressIndicator(assertIsDefined(this.progressBar), new class extends AbstractProgressScope {
                constructor() {
                    super(compositeDescriptor.id, !!isActive);
                    this._register(that.onDidCompositeOpen.event(e => this.onScopeOpened(e.composite.getId())));
                    this._register(that.onDidCompositeClose.event(e => this.onScopeClosed(e.getId())));
                }
            }());
            const compositeInstantiationService = this._register(this.instantiationService.createChild(new ServiceCollection([IEditorProgressService, compositeProgressIndicator] // provide the editor progress service for any editors instantiated within the composite
            )));
            const composite = compositeDescriptor.instantiate(compositeInstantiationService);
            const disposable = new DisposableStore();
            // Remember as Instantiated
            this.instantiatedCompositeItems.set(id, { composite, disposable, progress: compositeProgressIndicator });
            // Register to title area update events from the composite
            disposable.add(composite.onTitleAreaUpdate(() => this.onTitleAreaUpdate(composite.getId()), this));
            disposable.add(compositeInstantiationService);
            return composite;
        }
        throw new Error(`Unable to find composite with id ${id}`);
    }
    showComposite(composite) {
        // Remember Composite
        this.activeComposite = composite;
        // Store in preferences
        const id = this.activeComposite.getId();
        if (id !== this.defaultCompositeId) {
            this.storageService.store(this.activeCompositeSettingsKey, id, 1 /* StorageScope.WORKSPACE */, 1 /* StorageTarget.MACHINE */);
        }
        else {
            this.storageService.remove(this.activeCompositeSettingsKey, 1 /* StorageScope.WORKSPACE */);
        }
        // Remember
        this.lastActiveCompositeId = this.activeComposite.getId();
        // Composites created for the first time
        let compositeContainer = this.mapCompositeToCompositeContainer.get(composite.getId());
        if (!compositeContainer) {
            // Build Container off-DOM
            compositeContainer = $('.composite');
            compositeContainer.classList.add(...this.compositeCSSClass.split(' '));
            compositeContainer.id = composite.getId();
            composite.create(compositeContainer);
            composite.updateStyles();
            // Remember composite container
            this.mapCompositeToCompositeContainer.set(composite.getId(), compositeContainer);
        }
        // Fill Content and Actions
        // Make sure that the user meanwhile did not open another composite or closed the part containing the composite
        if (!this.activeComposite || composite.getId() !== this.activeComposite.getId()) {
            return undefined;
        }
        // Take Composite on-DOM and show
        const contentArea = this.getContentArea();
        contentArea?.appendChild(compositeContainer);
        show(compositeContainer);
        // Setup action runner
        const toolBar = assertIsDefined(this.toolBar);
        toolBar.actionRunner = composite.getActionRunner();
        // Update title with composite title if it differs from descriptor
        const descriptor = this.registry.getComposite(composite.getId());
        if (descriptor && descriptor.name !== composite.getTitle()) {
            this.updateTitle(composite.getId(), composite.getTitle());
        }
        // Handle Composite Actions
        let actionsBinding = this.mapActionsBindingToComposite.get(composite.getId());
        if (!actionsBinding) {
            actionsBinding = this.collectCompositeActions(composite);
            this.mapActionsBindingToComposite.set(composite.getId(), actionsBinding);
        }
        actionsBinding();
        // Action Run Handling
        this.actionsListener.value = toolBar.actionRunner.onDidRun(e => {
            // Check for Error
            if (e.error && !isCancellationError(e.error)) {
                this.notificationService.error(e.error);
            }
        });
        // Indicate to composite that it is now visible
        composite.setVisible(true);
        // Make sure that the user meanwhile did not open another composite or closed the part containing the composite
        if (!this.activeComposite || composite.getId() !== this.activeComposite.getId()) {
            return;
        }
        // Make sure the composite is layed out
        if (this.contentAreaSize) {
            composite.layout(this.contentAreaSize);
        }
        // Make sure boundary sashes are propagated
        if (this.boundarySashes) {
            composite.setBoundarySashes(this.boundarySashes);
        }
    }
    onTitleAreaUpdate(compositeId) {
        // Title
        const composite = this.instantiatedCompositeItems.get(compositeId);
        if (composite) {
            this.updateTitle(compositeId, composite.composite.getTitle());
        }
        // Active Composite
        if (this.activeComposite?.getId() === compositeId) {
            // Actions
            const actionsBinding = this.collectCompositeActions(this.activeComposite);
            this.mapActionsBindingToComposite.set(this.activeComposite.getId(), actionsBinding);
            actionsBinding();
        }
        // Otherwise invalidate actions binding for next time when the composite becomes visible
        else {
            this.mapActionsBindingToComposite.delete(compositeId);
        }
    }
    updateTitle(compositeId, compositeTitle) {
        const compositeDescriptor = this.registry.getComposite(compositeId);
        if (!compositeDescriptor || !this.titleLabel) {
            return;
        }
        if (!compositeTitle) {
            compositeTitle = compositeDescriptor.name;
        }
        const keybinding = this.keybindingService.lookupKeybinding(compositeId);
        this.titleLabel.updateTitle(compositeId, compositeTitle, keybinding?.getLabel() ?? undefined);
        const toolBar = assertIsDefined(this.toolBar);
        toolBar.setAriaLabel(localize('ariaCompositeToolbarLabel', "{0} actions", compositeTitle));
    }
    collectCompositeActions(composite) {
        // From Composite
        const menuIds = composite?.getMenuIds();
        const primaryActions = composite?.getActions().slice(0) || [];
        const secondaryActions = composite?.getSecondaryActions().slice(0) || [];
        // Update context
        const toolBar = assertIsDefined(this.toolBar);
        toolBar.context = this.actionsContextProvider();
        // Return fn to set into toolbar
        return () => toolBar.setActions(prepareActions(primaryActions), prepareActions(secondaryActions), menuIds);
    }
    getActiveComposite() {
        return this.activeComposite;
    }
    getLastActiveCompositeId() {
        return this.lastActiveCompositeId;
    }
    hideActiveComposite() {
        if (!this.activeComposite) {
            return undefined; // Nothing to do
        }
        const composite = this.activeComposite;
        this.activeComposite = undefined;
        const compositeContainer = this.mapCompositeToCompositeContainer.get(composite.getId());
        // Indicate to Composite
        composite.setVisible(false);
        // Take Container Off-DOM and hide
        if (compositeContainer) {
            compositeContainer.remove();
            hide(compositeContainer);
        }
        // Clear any running Progress
        this.progressBar?.stop().hide();
        // Empty Actions
        if (this.toolBar) {
            this.collectCompositeActions()();
        }
        this.onDidCompositeClose.fire(composite);
        return composite;
    }
    createTitleArea(parent) {
        // Title Area Container
        const titleArea = append(parent, $('.composite'));
        titleArea.classList.add('title');
        // Left Title Label
        this.titleLabel = this.createTitleLabel(titleArea);
        // Right Actions Container
        const titleActionsContainer = append(titleArea, $('.title-actions'));
        // Toolbar
        this.toolBar = this._register(this.instantiationService.createInstance(WorkbenchToolBar, titleActionsContainer, {
            actionViewItemProvider: (action, options) => this.actionViewItemProvider(action, options),
            orientation: 0 /* ActionsOrientation.HORIZONTAL */,
            getKeyBinding: action => this.keybindingService.lookupKeybinding(action.id),
            anchorAlignmentProvider: () => this.getTitleAreaDropDownAnchorAlignment(),
            toggleMenuTitle: localize('viewsAndMoreActions', "Views and More Actions..."),
            telemetrySource: this.nameForTelemetry,
            hoverDelegate: this.toolbarHoverDelegate
        }));
        this.collectCompositeActions()();
        return titleArea;
    }
    createTitleLabel(parent) {
        const titleContainer = append(parent, $('.title-label'));
        const titleLabel = append(titleContainer, $('h2'));
        this.titleLabelElement = titleLabel;
        const hover = this._register(this.hoverService.setupManagedHover(getDefaultHoverDelegate('mouse'), titleLabel, ''));
        const $this = this;
        return {
            updateTitle: (id, title, keybinding) => {
                // The title label is shared for all composites in the base CompositePart
                if (!this.activeComposite || this.activeComposite.getId() === id) {
                    titleLabel.innerText = title;
                    hover.update(keybinding ? localize('titleTooltip', "{0} ({1})", title, keybinding) : title);
                }
            },
            updateStyles: () => {
                titleLabel.style.color = $this.titleForegroundColor ? $this.getColor($this.titleForegroundColor) || '' : '';
            }
        };
    }
    createHeaderArea() {
        return $('.composite');
    }
    createFooterArea() {
        return $('.composite');
    }
    updateStyles() {
        super.updateStyles();
        // Forward to title label
        const titleLabel = assertIsDefined(this.titleLabel);
        titleLabel.updateStyles();
    }
    actionViewItemProvider(action, options) {
        // Check Active Composite
        if (this.activeComposite) {
            return this.activeComposite.getActionViewItem(action, options);
        }
        return createActionViewItem(this.instantiationService, action, options);
    }
    actionsContextProvider() {
        // Check Active Composite
        if (this.activeComposite) {
            return this.activeComposite.getActionsContext();
        }
        return null;
    }
    createContentArea(parent) {
        const contentContainer = append(parent, $('.content'));
        this.progressBar = this._register(new ProgressBar(contentContainer, defaultProgressBarStyles));
        this.progressBar.hide();
        return contentContainer;
    }
    getProgressIndicator(id) {
        const compositeItem = this.instantiatedCompositeItems.get(id);
        return compositeItem ? compositeItem.progress : undefined;
    }
    getTitleAreaDropDownAnchorAlignment() {
        return 1 /* AnchorAlignment.RIGHT */;
    }
    layout(width, height, top, left) {
        super.layout(width, height, top, left);
        // Layout contents
        this.contentAreaSize = Dimension.lift(super.layoutContents(width, height).contentSize);
        // Layout composite
        this.activeComposite?.layout(this.contentAreaSize);
    }
    setBoundarySashes(sashes) {
        this.boundarySashes = sashes;
        this.activeComposite?.setBoundarySashes(sashes);
    }
    removeComposite(compositeId) {
        if (this.activeComposite?.getId() === compositeId) {
            return false; // do not remove active composite
        }
        this.mapCompositeToCompositeContainer.delete(compositeId);
        this.mapActionsBindingToComposite.delete(compositeId);
        const compositeItem = this.instantiatedCompositeItems.get(compositeId);
        if (compositeItem) {
            compositeItem.composite.dispose();
            dispose(compositeItem.disposable);
            this.instantiatedCompositeItems.delete(compositeId);
        }
        return true;
    }
    dispose() {
        this.mapCompositeToCompositeContainer.clear();
        this.mapActionsBindingToComposite.clear();
        this.instantiatedCompositeItems.forEach(compositeItem => {
            compositeItem.composite.dispose();
            dispose(compositeItem.disposable);
        });
        this.instantiatedCompositeItems.clear();
        super.dispose();
    }
}
