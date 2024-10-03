import './media/singleeditortabscontrol.css';
import { EditorResourceAccessor, SideBySideEditor, preventEditorClose, EditorCloseMethod } from '../../../common/editor.js';
import { EditorTabsControl } from './editorTabsControl.js';
import { ResourceLabel } from '../../labels.js';
import { TAB_ACTIVE_FOREGROUND, TAB_UNFOCUSED_ACTIVE_FOREGROUND } from '../../../common/theme.js';
import { EventType as TouchEventType, Gesture } from '../../../../base/browser/touch.js';
import { addDisposableListener, EventType, EventHelper, Dimension, isAncestor, DragAndDropObserver, isHTMLElement } from '../../../../base/browser/dom.js';
import { CLOSE_EDITOR_COMMAND_ID, UNLOCK_GROUP_COMMAND_ID } from './editorCommands.js';
import { Color } from '../../../../base/common/color.js';
import { assertIsDefined, assertAllDefined } from '../../../../base/common/types.js';
import { equals } from '../../../../base/common/objects.js';
import { toDisposable } from '../../../../base/common/lifecycle.js';
import { defaultBreadcrumbsWidgetStyles } from '../../../../platform/theme/browser/defaultStyles.js';
import { BreadcrumbsControlFactory } from './breadcrumbsControl.js';
export class SingleEditorTabsControl extends EditorTabsControl {
    constructor() {
        super(...arguments);
        this.activeLabel = Object.create(null);
    }
    get breadcrumbsControl() { return this.breadcrumbsControlFactory?.control; }
    create(parent) {
        super.create(parent);
        const titleContainer = this.titleContainer = parent;
        titleContainer.draggable = true;
        this.registerContainerListeners(titleContainer);
        this._register(Gesture.addTarget(titleContainer));
        const labelContainer = document.createElement('div');
        labelContainer.classList.add('label-container');
        titleContainer.appendChild(labelContainer);
        this.editorLabel = this._register(this.instantiationService.createInstance(ResourceLabel, labelContainer, { hoverDelegate: this.getHoverDelegate() })).element;
        this._register(addDisposableListener(this.editorLabel.element, EventType.CLICK, e => this.onTitleLabelClick(e)));
        this.breadcrumbsControlFactory = this._register(this.instantiationService.createInstance(BreadcrumbsControlFactory, labelContainer, this.groupView, {
            showFileIcons: false,
            showSymbolIcons: true,
            showDecorationColors: false,
            widgetStyles: { ...defaultBreadcrumbsWidgetStyles, breadcrumbsBackground: Color.transparent.toString() },
            showPlaceholder: false
        }));
        this._register(this.breadcrumbsControlFactory.onDidEnablementChange(() => this.handleBreadcrumbsEnablementChange()));
        titleContainer.classList.toggle('breadcrumbs', Boolean(this.breadcrumbsControl));
        this._register(toDisposable(() => titleContainer.classList.remove('breadcrumbs')));
        this.createEditorActionsToolBar(titleContainer, ['title-actions']);
        return titleContainer;
    }
    registerContainerListeners(titleContainer) {
        let lastDragEvent = undefined;
        let isNewWindowOperation = false;
        this._register(new DragAndDropObserver(titleContainer, {
            onDragStart: e => { isNewWindowOperation = this.onGroupDragStart(e, titleContainer); },
            onDrag: e => { lastDragEvent = e; },
            onDragEnd: e => { this.onGroupDragEnd(e, lastDragEvent, titleContainer, isNewWindowOperation); },
        }));
        this._register(addDisposableListener(titleContainer, EventType.DBLCLICK, e => this.onTitleDoubleClick(e)));
        this._register(addDisposableListener(titleContainer, EventType.AUXCLICK, e => this.onTitleAuxClick(e)));
        this._register(addDisposableListener(titleContainer, TouchEventType.Tap, (e) => this.onTitleTap(e)));
        for (const event of [EventType.CONTEXT_MENU, TouchEventType.Contextmenu]) {
            this._register(addDisposableListener(titleContainer, event, e => {
                if (this.tabsModel.activeEditor) {
                    this.onTabContextMenu(this.tabsModel.activeEditor, e, titleContainer);
                }
            }));
        }
    }
    onTitleLabelClick(e) {
        EventHelper.stop(e, false);
        setTimeout(() => this.quickInputService.quickAccess.show());
    }
    onTitleDoubleClick(e) {
        EventHelper.stop(e);
        this.groupView.pinEditor();
    }
    onTitleAuxClick(e) {
        if (e.button === 1 && this.tabsModel.activeEditor) {
            EventHelper.stop(e, true);
            if (!preventEditorClose(this.tabsModel, this.tabsModel.activeEditor, EditorCloseMethod.MOUSE, this.groupsView.partOptions)) {
                this.groupView.closeEditor(this.tabsModel.activeEditor);
            }
        }
    }
    onTitleTap(e) {
        const target = e.initialTarget;
        if (!(isHTMLElement(target)) || !this.editorLabel || !isAncestor(target, this.editorLabel.element)) {
            return;
        }
        setTimeout(() => this.quickInputService.quickAccess.show(), 50);
    }
    openEditor(editor) {
        return this.doHandleOpenEditor();
    }
    openEditors(editors) {
        return this.doHandleOpenEditor();
    }
    doHandleOpenEditor() {
        const activeEditorChanged = this.ifActiveEditorChanged(() => this.redraw());
        if (!activeEditorChanged) {
            this.ifActiveEditorPropertiesChanged(() => this.redraw());
        }
        return activeEditorChanged;
    }
    beforeCloseEditor(editor) {
    }
    closeEditor(editor) {
        this.ifActiveEditorChanged(() => this.redraw());
    }
    closeEditors(editors) {
        this.ifActiveEditorChanged(() => this.redraw());
    }
    moveEditor(editor, fromIndex, targetIndex) {
        this.ifActiveEditorChanged(() => this.redraw());
    }
    pinEditor(editor) {
        this.ifEditorIsActive(editor, () => this.redraw());
    }
    stickEditor(editor) { }
    unstickEditor(editor) { }
    setActive(isActive) {
        this.redraw();
    }
    updateEditorSelections() { }
    updateEditorLabel(editor) {
        this.ifEditorIsActive(editor, () => this.redraw());
    }
    updateEditorDirty(editor) {
        this.ifEditorIsActive(editor, () => {
            const titleContainer = assertIsDefined(this.titleContainer);
            if (editor.isDirty() && !editor.isSaving()) {
                titleContainer.classList.add('dirty');
            }
            else {
                titleContainer.classList.remove('dirty');
            }
        });
    }
    updateOptions(oldOptions, newOptions) {
        super.updateOptions(oldOptions, newOptions);
        if (oldOptions.labelFormat !== newOptions.labelFormat || !equals(oldOptions.decorations, newOptions.decorations)) {
            this.redraw();
        }
    }
    updateStyles() {
        this.redraw();
    }
    handleBreadcrumbsEnablementChange() {
        const titleContainer = assertIsDefined(this.titleContainer);
        titleContainer.classList.toggle('breadcrumbs', Boolean(this.breadcrumbsControl));
        this.redraw();
    }
    ifActiveEditorChanged(fn) {
        if (!this.activeLabel.editor && this.tabsModel.activeEditor ||
            this.activeLabel.editor && !this.tabsModel.activeEditor ||
            (!this.activeLabel.editor || !this.tabsModel.isActive(this.activeLabel.editor))) {
            fn();
            return true;
        }
        return false;
    }
    ifActiveEditorPropertiesChanged(fn) {
        if (!this.activeLabel.editor || !this.tabsModel.activeEditor) {
            return;
        }
        if (this.activeLabel.pinned !== this.tabsModel.isPinned(this.tabsModel.activeEditor)) {
            fn();
        }
    }
    ifEditorIsActive(editor, fn) {
        if (this.tabsModel.isActive(editor)) {
            fn();
        }
    }
    redraw() {
        const editor = this.tabsModel.activeEditor ?? undefined;
        const options = this.groupsView.partOptions;
        const isEditorPinned = editor ? this.tabsModel.isPinned(editor) : false;
        const isGroupActive = this.groupsView.activeGroup === this.groupView;
        this.activeLabel = { editor, pinned: isEditorPinned };
        if (this.breadcrumbsControl) {
            if (isGroupActive) {
                this.breadcrumbsControl.update();
                this.breadcrumbsControl.domNode.classList.toggle('preview', !isEditorPinned);
            }
            else {
                this.breadcrumbsControl.hide();
            }
        }
        const [titleContainer, editorLabel] = assertAllDefined(this.titleContainer, this.editorLabel);
        if (!editor) {
            titleContainer.classList.remove('dirty');
            editorLabel.clear();
            this.clearEditorActionsToolbar();
        }
        else {
            this.updateEditorDirty(editor);
            const { labelFormat } = this.groupsView.partOptions;
            let description;
            if (this.breadcrumbsControl && !this.breadcrumbsControl.isHidden()) {
                description = '';
            }
            else if (labelFormat === 'default' && !isGroupActive) {
                description = '';
            }
            else {
                description = editor.getDescription(this.getVerbosity(labelFormat)) || '';
            }
            editorLabel.setResource({
                resource: EditorResourceAccessor.getOriginalUri(editor, { supportSideBySide: SideBySideEditor.BOTH }),
                name: editor.getName(),
                description
            }, {
                title: this.getHoverTitle(editor),
                italic: !isEditorPinned,
                extraClasses: ['single-tab', 'title-label'].concat(editor.getLabelExtraClasses()),
                fileDecorations: {
                    colors: Boolean(options.decorations?.colors),
                    badges: Boolean(options.decorations?.badges)
                },
                icon: editor.getIcon(),
                hideIcon: options.showIcons === false,
            });
            if (isGroupActive) {
                titleContainer.style.color = this.getColor(TAB_ACTIVE_FOREGROUND) || '';
            }
            else {
                titleContainer.style.color = this.getColor(TAB_UNFOCUSED_ACTIVE_FOREGROUND) || '';
            }
            this.updateEditorActionsToolbar();
        }
    }
    getVerbosity(style) {
        switch (style) {
            case 'short': return 0;
            case 'long': return 2;
            default: return 1;
        }
    }
    prepareEditorActions(editorActions) {
        const isGroupActive = this.groupsView.activeGroup === this.groupView;
        if (isGroupActive) {
            return editorActions;
        }
        else {
            return {
                primary: this.groupsView.partOptions.alwaysShowEditorActions ? editorActions.primary : editorActions.primary.filter(action => action.id === CLOSE_EDITOR_COMMAND_ID || action.id === UNLOCK_GROUP_COMMAND_ID),
                secondary: editorActions.secondary
            };
        }
    }
    getHeight() {
        return this.tabHeight;
    }
    layout(dimensions) {
        this.breadcrumbsControl?.layout(undefined);
        return new Dimension(dimensions.container.width, this.getHeight());
    }
}
