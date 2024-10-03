import { localize } from '../../nls.js';
import { assertIsDefined } from '../../base/common/types.js';
import { URI } from '../../base/common/uri.js';
import { Disposable, toDisposable } from '../../base/common/lifecycle.js';
import { IInstantiationService } from '../../platform/instantiation/common/instantiation.js';
import { Registry } from '../../platform/registry/common/platform.js';
import { FileType } from '../../platform/files/common/files.js';
import { Schemas } from '../../base/common/network.js';
import { createErrorWithActions, isErrorWithActions } from '../../base/common/errorMessage.js';
import { toAction } from '../../base/common/actions.js';
import Severity from '../../base/common/severity.js';
export const EditorExtensions = {
    EditorPane: 'workbench.contributions.editors',
    EditorFactory: 'workbench.contributions.editor.inputFactories'
};
export const DEFAULT_EDITOR_ASSOCIATION = {
    id: 'default',
    displayName: localize('promptOpenWith.defaultEditor.displayName', "Text Editor"),
    providerDisplayName: localize('builtinProviderDisplayName', "Built-in")
};
export const SIDE_BY_SIDE_EDITOR_ID = 'workbench.editor.sidebysideEditor';
export const TEXT_DIFF_EDITOR_ID = 'workbench.editors.textDiffEditor';
export const BINARY_DIFF_EDITOR_ID = 'workbench.editors.binaryResourceDiffEditor';
export function isEditorPaneWithSelection(editorPane) {
    const candidate = editorPane;
    return !!candidate && typeof candidate.getSelection === 'function' && !!candidate.onDidChangeSelection;
}
export function isEditorPaneWithScrolling(editorPane) {
    const candidate = editorPane;
    return !!candidate && typeof candidate.getScrollPosition === 'function' && typeof candidate.setScrollPosition === 'function' && !!candidate.onDidChangeScroll;
}
export function findViewStateForEditor(input, group, editorService) {
    for (const editorPane of editorService.visibleEditorPanes) {
        if (editorPane.group.id === group && input.matches(editorPane.input)) {
            return editorPane.getViewState();
        }
    }
    return undefined;
}
export function isResourceEditorInput(editor) {
    if (isEditorInput(editor)) {
        return false;
    }
    const candidate = editor;
    return URI.isUri(candidate?.resource);
}
export function isResourceDiffEditorInput(editor) {
    if (isEditorInput(editor)) {
        return false;
    }
    const candidate = editor;
    return candidate?.original !== undefined && candidate.modified !== undefined;
}
export function isResourceMultiDiffEditorInput(editor) {
    if (isEditorInput(editor)) {
        return false;
    }
    const candidate = editor;
    if (!candidate) {
        return false;
    }
    if (candidate.resources && !Array.isArray(candidate.resources)) {
        return false;
    }
    return !!candidate.resources || !!candidate.multiDiffSource;
}
export function isResourceSideBySideEditorInput(editor) {
    if (isEditorInput(editor)) {
        return false;
    }
    if (isResourceDiffEditorInput(editor)) {
        return false;
    }
    const candidate = editor;
    return candidate?.primary !== undefined && candidate.secondary !== undefined;
}
export function isUntitledResourceEditorInput(editor) {
    if (isEditorInput(editor)) {
        return false;
    }
    const candidate = editor;
    if (!candidate) {
        return false;
    }
    return candidate.resource === undefined || candidate.resource.scheme === Schemas.untitled || candidate.forceUntitled === true;
}
export function isResourceMergeEditorInput(editor) {
    if (isEditorInput(editor)) {
        return false;
    }
    const candidate = editor;
    return URI.isUri(candidate?.base?.resource) && URI.isUri(candidate?.input1?.resource) && URI.isUri(candidate?.input2?.resource) && URI.isUri(candidate?.result?.resource);
}
class SaveSourceFactory {
    constructor() {
        this.mapIdToSaveSource = new Map();
    }
    registerSource(id, label) {
        let sourceDescriptor = this.mapIdToSaveSource.get(id);
        if (!sourceDescriptor) {
            sourceDescriptor = { source: id, label };
            this.mapIdToSaveSource.set(id, sourceDescriptor);
        }
        return sourceDescriptor.source;
    }
    getSourceLabel(source) {
        return this.mapIdToSaveSource.get(source)?.label ?? source;
    }
}
export const SaveSourceRegistry = new SaveSourceFactory();
export class AbstractEditorInput extends Disposable {
}
export function isEditorInput(editor) {
    return editor instanceof AbstractEditorInput;
}
function isEditorInputWithPreferredResource(editor) {
    const candidate = editor;
    return URI.isUri(candidate?.preferredResource);
}
export function isSideBySideEditorInput(editor) {
    const candidate = editor;
    return isEditorInput(candidate?.primary) && isEditorInput(candidate?.secondary);
}
export function isDiffEditorInput(editor) {
    const candidate = editor;
    return isEditorInput(candidate?.modified) && isEditorInput(candidate?.original);
}
export function createTooLargeFileError(group, input, options, message, preferencesService) {
    return createEditorOpenError(message, [
        toAction({
            id: 'workbench.action.openLargeFile', label: localize('openLargeFile', "Open Anyway"), run: () => {
                const fileEditorOptions = {
                    ...options,
                    limits: {
                        size: Number.MAX_VALUE
                    }
                };
                group.openEditor(input, fileEditorOptions);
            }
        }),
        toAction({
            id: 'workbench.action.configureEditorLargeFileConfirmation', label: localize('configureEditorLargeFileConfirmation', "Configure Limit"), run: () => {
                return preferencesService.openUserSettings({ query: 'workbench.editorLargeFileConfirmation' });
            }
        }),
    ], {
        forceMessage: true,
        forceSeverity: Severity.Warning
    });
}
export function isEditorInputWithOptions(editor) {
    const candidate = editor;
    return isEditorInput(candidate?.editor);
}
export function isEditorInputWithOptionsAndGroup(editor) {
    const candidate = editor;
    return isEditorInputWithOptions(editor) && candidate?.group !== undefined;
}
export function isEditorIdentifier(identifier) {
    const candidate = identifier;
    return typeof candidate?.groupId === 'number' && isEditorInput(candidate.editor);
}
export function isEditorCommandsContext(context) {
    const candidate = context;
    return typeof candidate?.groupId === 'number';
}
export var EditorCloseContext;
(function (EditorCloseContext) {
    EditorCloseContext[EditorCloseContext["UNKNOWN"] = 0] = "UNKNOWN";
    EditorCloseContext[EditorCloseContext["REPLACE"] = 1] = "REPLACE";
    EditorCloseContext[EditorCloseContext["MOVE"] = 2] = "MOVE";
    EditorCloseContext[EditorCloseContext["UNPIN"] = 3] = "UNPIN";
})(EditorCloseContext || (EditorCloseContext = {}));
export var SideBySideEditor;
(function (SideBySideEditor) {
    SideBySideEditor[SideBySideEditor["PRIMARY"] = 1] = "PRIMARY";
    SideBySideEditor[SideBySideEditor["SECONDARY"] = 2] = "SECONDARY";
    SideBySideEditor[SideBySideEditor["BOTH"] = 3] = "BOTH";
    SideBySideEditor[SideBySideEditor["ANY"] = 4] = "ANY";
})(SideBySideEditor || (SideBySideEditor = {}));
class EditorResourceAccessorImpl {
    getOriginalUri(editor, options) {
        if (!editor) {
            return undefined;
        }
        if (isResourceMergeEditorInput(editor)) {
            return EditorResourceAccessor.getOriginalUri(editor.result, options);
        }
        if (options?.supportSideBySide) {
            const { primary, secondary } = this.getSideEditors(editor);
            if (primary && secondary) {
                if (options?.supportSideBySide === SideBySideEditor.BOTH) {
                    return {
                        primary: this.getOriginalUri(primary, { filterByScheme: options.filterByScheme }),
                        secondary: this.getOriginalUri(secondary, { filterByScheme: options.filterByScheme })
                    };
                }
                else if (options?.supportSideBySide === SideBySideEditor.ANY) {
                    return this.getOriginalUri(primary, { filterByScheme: options.filterByScheme }) ?? this.getOriginalUri(secondary, { filterByScheme: options.filterByScheme });
                }
                editor = options.supportSideBySide === SideBySideEditor.PRIMARY ? primary : secondary;
            }
        }
        if (isResourceDiffEditorInput(editor) || isResourceMultiDiffEditorInput(editor) || isResourceSideBySideEditorInput(editor) || isResourceMergeEditorInput(editor)) {
            return undefined;
        }
        const originalResource = isEditorInputWithPreferredResource(editor) ? editor.preferredResource : editor.resource;
        if (!originalResource || !options || !options.filterByScheme) {
            return originalResource;
        }
        return this.filterUri(originalResource, options.filterByScheme);
    }
    getSideEditors(editor) {
        if (isSideBySideEditorInput(editor) || isResourceSideBySideEditorInput(editor)) {
            return { primary: editor.primary, secondary: editor.secondary };
        }
        if (isDiffEditorInput(editor) || isResourceDiffEditorInput(editor)) {
            return { primary: editor.modified, secondary: editor.original };
        }
        return { primary: undefined, secondary: undefined };
    }
    getCanonicalUri(editor, options) {
        if (!editor) {
            return undefined;
        }
        if (isResourceMergeEditorInput(editor)) {
            return EditorResourceAccessor.getCanonicalUri(editor.result, options);
        }
        if (options?.supportSideBySide) {
            const { primary, secondary } = this.getSideEditors(editor);
            if (primary && secondary) {
                if (options?.supportSideBySide === SideBySideEditor.BOTH) {
                    return {
                        primary: this.getCanonicalUri(primary, { filterByScheme: options.filterByScheme }),
                        secondary: this.getCanonicalUri(secondary, { filterByScheme: options.filterByScheme })
                    };
                }
                else if (options?.supportSideBySide === SideBySideEditor.ANY) {
                    return this.getCanonicalUri(primary, { filterByScheme: options.filterByScheme }) ?? this.getCanonicalUri(secondary, { filterByScheme: options.filterByScheme });
                }
                editor = options.supportSideBySide === SideBySideEditor.PRIMARY ? primary : secondary;
            }
        }
        if (isResourceDiffEditorInput(editor) || isResourceMultiDiffEditorInput(editor) || isResourceSideBySideEditorInput(editor) || isResourceMergeEditorInput(editor)) {
            return undefined;
        }
        const canonicalResource = editor.resource;
        if (!canonicalResource || !options || !options.filterByScheme) {
            return canonicalResource;
        }
        return this.filterUri(canonicalResource, options.filterByScheme);
    }
    filterUri(resource, filter) {
        if (Array.isArray(filter)) {
            if (filter.some(scheme => resource.scheme === scheme)) {
                return resource;
            }
        }
        else {
            if (filter === resource.scheme) {
                return resource;
            }
        }
        return undefined;
    }
}
export var EditorCloseMethod;
(function (EditorCloseMethod) {
    EditorCloseMethod[EditorCloseMethod["UNKNOWN"] = 0] = "UNKNOWN";
    EditorCloseMethod[EditorCloseMethod["KEYBOARD"] = 1] = "KEYBOARD";
    EditorCloseMethod[EditorCloseMethod["MOUSE"] = 2] = "MOUSE";
})(EditorCloseMethod || (EditorCloseMethod = {}));
export function preventEditorClose(group, editor, method, configuration) {
    if (!group.isSticky(editor)) {
        return false;
    }
    switch (configuration.preventPinnedEditorClose) {
        case 'keyboardAndMouse': return method === EditorCloseMethod.MOUSE || method === EditorCloseMethod.KEYBOARD;
        case 'mouse': return method === EditorCloseMethod.MOUSE;
        case 'keyboard': return method === EditorCloseMethod.KEYBOARD;
    }
    return false;
}
export const EditorResourceAccessor = new EditorResourceAccessorImpl();
class EditorFactoryRegistry {
    constructor() {
        this.editorSerializerConstructors = new Map();
        this.editorSerializerInstances = new Map();
    }
    start(accessor) {
        const instantiationService = this.instantiationService = accessor.get(IInstantiationService);
        for (const [key, ctor] of this.editorSerializerConstructors) {
            this.createEditorSerializer(key, ctor, instantiationService);
        }
        this.editorSerializerConstructors.clear();
    }
    createEditorSerializer(editorTypeId, ctor, instantiationService) {
        const instance = instantiationService.createInstance(ctor);
        this.editorSerializerInstances.set(editorTypeId, instance);
    }
    registerFileEditorFactory(factory) {
        if (this.fileEditorFactory) {
            throw new Error('Can only register one file editor factory.');
        }
        this.fileEditorFactory = factory;
    }
    getFileEditorFactory() {
        return assertIsDefined(this.fileEditorFactory);
    }
    registerEditorSerializer(editorTypeId, ctor) {
        if (this.editorSerializerConstructors.has(editorTypeId) || this.editorSerializerInstances.has(editorTypeId)) {
            throw new Error(`A editor serializer with type ID '${editorTypeId}' was already registered.`);
        }
        if (!this.instantiationService) {
            this.editorSerializerConstructors.set(editorTypeId, ctor);
        }
        else {
            this.createEditorSerializer(editorTypeId, ctor, this.instantiationService);
        }
        return toDisposable(() => {
            this.editorSerializerConstructors.delete(editorTypeId);
            this.editorSerializerInstances.delete(editorTypeId);
        });
    }
    getEditorSerializer(arg1) {
        return this.editorSerializerInstances.get(typeof arg1 === 'string' ? arg1 : arg1.typeId);
    }
}
Registry.add(EditorExtensions.EditorFactory, new EditorFactoryRegistry());
export async function pathsToEditors(paths, fileService, logService) {
    if (!paths || !paths.length) {
        return [];
    }
    return await Promise.all(paths.map(async (path) => {
        const resource = URI.revive(path.fileUri);
        if (!resource) {
            logService.info('Cannot resolve the path because it is not valid.', path);
            return undefined;
        }
        const canHandleResource = await fileService.canHandleResource(resource);
        if (!canHandleResource) {
            logService.info('Cannot resolve the path because it cannot be handled', path);
            return undefined;
        }
        let exists = path.exists;
        let type = path.type;
        if (typeof exists !== 'boolean' || typeof type !== 'number') {
            try {
                type = (await fileService.stat(resource)).isDirectory ? FileType.Directory : FileType.Unknown;
                exists = true;
            }
            catch (error) {
                logService.error(error);
                exists = false;
            }
        }
        if (!exists && path.openOnlyIfExists) {
            logService.info('Cannot resolve the path because it does not exist', path);
            return undefined;
        }
        if (type === FileType.Directory) {
            logService.info('Cannot resolve the path because it is a directory', path);
            return undefined;
        }
        const options = {
            ...path.options,
            pinned: true
        };
        if (!exists) {
            return { resource, options, forceUntitled: true };
        }
        return { resource, options };
    }));
}
export function isTextEditorViewState(candidate) {
    const viewState = candidate;
    if (!viewState) {
        return false;
    }
    const diffEditorViewState = viewState;
    if (diffEditorViewState.modified) {
        return isTextEditorViewState(diffEditorViewState.modified);
    }
    const codeEditorViewState = viewState;
    return !!(codeEditorViewState.contributionsState && codeEditorViewState.viewState && Array.isArray(codeEditorViewState.cursorState));
}
export function isEditorOpenError(obj) {
    return isErrorWithActions(obj);
}
export function createEditorOpenError(messageOrError, actions, options) {
    const error = createErrorWithActions(messageOrError, actions);
    error.forceMessage = options?.forceMessage;
    error.forceSeverity = options?.forceSeverity;
    error.allowDialog = options?.allowDialog;
    return error;
}
