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
var MultiDiffEditorInput_1;
import { LazyStatefulPromise, raceTimeout } from '../../../../base/common/async.js';
import { BugIndicatingError, onUnexpectedError } from '../../../../base/common/errors.js';
import { Event, ValueWithChangeEvent } from '../../../../base/common/event.js';
import { Disposable, DisposableStore } from '../../../../base/common/lifecycle.js';
import { parse } from '../../../../base/common/marshalling.js';
import { Schemas } from '../../../../base/common/network.js';
import { deepClone } from '../../../../base/common/objects.js';
import { ObservableLazyPromise, ValueWithChangeEventFromObservable, autorun, constObservable, derived, mapObservableArrayCached, observableFromEvent, observableFromValueWithChangeEvent, observableValue, recomputeInitiallyAndOnChange } from '../../../../base/common/observable.js';
import { isDefined, isObject } from '../../../../base/common/types.js';
import { URI } from '../../../../base/common/uri.js';
import { RefCounted } from '../../../../editor/browser/widget/diffEditor/utils.js';
import { MultiDiffEditorViewModel } from '../../../../editor/browser/widget/multiDiffEditor/multiDiffEditorViewModel.js';
import { ITextModelService } from '../../../../editor/common/services/resolverService.js';
import { ITextResourceConfigurationService } from '../../../../editor/common/services/textResourceConfiguration.js';
import { localize } from '../../../../nls.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { DEFAULT_EDITOR_ASSOCIATION } from '../../../common/editor.js';
import { EditorInput } from '../../../common/editor/editorInput.js';
import { IEditorResolverService, RegisteredEditorPriority } from '../../../services/editor/common/editorResolverService.js';
import { ITextFileService } from '../../../services/textfile/common/textfiles.js';
import { MultiDiffEditorIcon } from './icons.contribution.js';
import { IMultiDiffSourceResolverService, MultiDiffEditorItem } from './multiDiffSourceResolverService.js';
let MultiDiffEditorInput = class MultiDiffEditorInput extends EditorInput {
    static { MultiDiffEditorInput_1 = this; }
    static fromResourceMultiDiffEditorInput(input, instantiationService) {
        if (!input.multiDiffSource && !input.resources) {
            throw new BugIndicatingError('MultiDiffEditorInput requires either multiDiffSource or resources');
        }
        const multiDiffSource = input.multiDiffSource ?? URI.parse(`multi-diff-editor:${new Date().getMilliseconds().toString() + Math.random().toString()}`);
        return instantiationService.createInstance(MultiDiffEditorInput_1, multiDiffSource, input.label, input.resources?.map(resource => {
            return new MultiDiffEditorItem(resource.original.resource, resource.modified.resource, resource.goToFileResource);
        }), input.isTransient ?? false);
    }
    static fromSerialized(data, instantiationService) {
        return instantiationService.createInstance(MultiDiffEditorInput_1, URI.parse(data.multiDiffSourceUri), data.label, data.resources?.map(resource => new MultiDiffEditorItem(resource.originalUri ? URI.parse(resource.originalUri) : undefined, resource.modifiedUri ? URI.parse(resource.modifiedUri) : undefined, resource.goToFileUri ? URI.parse(resource.goToFileUri) : undefined)), false);
    }
    static { this.ID = 'workbench.input.multiDiffEditor'; }
    get resource() { return this.multiDiffSource; }
    get capabilities() { return 2; }
    get typeId() { return MultiDiffEditorInput_1.ID; }
    getName() { return this._name; }
    get editorId() { return DEFAULT_EDITOR_ASSOCIATION.id; }
    getIcon() { return MultiDiffEditorIcon; }
    constructor(multiDiffSource, label, initialResources, isTransient = false, _textModelService, _textResourceConfigurationService, _instantiationService, _multiDiffSourceResolverService, _textFileService) {
        super();
        this.multiDiffSource = multiDiffSource;
        this.label = label;
        this.initialResources = initialResources;
        this.isTransient = isTransient;
        this._textModelService = _textModelService;
        this._textResourceConfigurationService = _textResourceConfigurationService;
        this._instantiationService = _instantiationService;
        this._multiDiffSourceResolverService = _multiDiffSourceResolverService;
        this._textFileService = _textFileService;
        this._name = '';
        this._viewModel = new LazyStatefulPromise(async () => {
            const model = await this._createModel();
            this._register(model);
            const vm = new MultiDiffEditorViewModel(model, this._instantiationService);
            this._register(vm);
            await raceTimeout(vm.waitForDiffs(), 1000);
            return vm;
        });
        this._resolvedSource = new ObservableLazyPromise(async () => {
            const source = this.initialResources
                ? { resources: ValueWithChangeEvent.const(this.initialResources) }
                : await this._multiDiffSourceResolverService.resolve(this.multiDiffSource);
            return {
                source,
                resources: source ? observableFromValueWithChangeEvent(this, source.resources) : constObservable([]),
            };
        });
        this.resources = derived(this, reader => this._resolvedSource.cachedPromiseResult.read(reader)?.data?.resources.read(reader));
        this.textFileServiceOnDidChange = new FastEventDispatcher(this._textFileService.files.onDidChangeDirty, item => item.resource.toString(), uri => uri.toString());
        this._isDirtyObservables = mapObservableArrayCached(this, this.resources.map(r => r ?? []), res => {
            const isModifiedDirty = res.modifiedUri ? isUriDirty(this.textFileServiceOnDidChange, this._textFileService, res.modifiedUri) : constObservable(false);
            const isOriginalDirty = res.originalUri ? isUriDirty(this.textFileServiceOnDidChange, this._textFileService, res.originalUri) : constObservable(false);
            return derived(reader => isModifiedDirty.read(reader) || isOriginalDirty.read(reader));
        }, i => i.getKey());
        this._isDirtyObservable = derived(this, reader => this._isDirtyObservables.read(reader).some(isDirty => isDirty.read(reader)))
            .keepObserved(this._store);
        this.onDidChangeDirty = Event.fromObservableLight(this._isDirtyObservable);
        this.closeHandler = {
            async confirm() {
                return 1;
            },
            showConfirm() {
                return false;
            }
        };
        this._register(autorun((reader) => {
            const resources = this.resources.read(reader);
            const label = this.label ?? localize('name', "Multi Diff Editor");
            if (resources) {
                this._name = label + localize({
                    key: 'files',
                    comment: ['the number of files being shown']
                }, " ({0} files)", resources.length);
            }
            else {
                this._name = label;
            }
            this._onDidChangeLabel.fire();
        }));
    }
    serialize() {
        return {
            label: this.label,
            multiDiffSourceUri: this.multiDiffSource.toString(),
            resources: this.initialResources?.map(resource => ({
                originalUri: resource.originalUri?.toString(),
                modifiedUri: resource.modifiedUri?.toString(),
                goToFileUri: resource.goToFileUri?.toString(),
            })),
        };
    }
    setLanguageId(languageId, source) {
        const activeDiffItem = this._viewModel.requireValue().activeDiffItem.get();
        const value = activeDiffItem?.documentDiffItem;
        if (!value) {
            return;
        }
        const target = value.modified ?? value.original;
        if (!target) {
            return;
        }
        target.setLanguage(languageId, source);
    }
    async getViewModel() {
        return this._viewModel.getPromise();
    }
    async _createModel() {
        const source = await this._resolvedSource.getPromise();
        const textResourceConfigurationService = this._textResourceConfigurationService;
        const documentsWithPromises = mapObservableArrayCached(this, source.resources, async (r, store) => {
            let original;
            let modified;
            const multiDiffItemStore = new DisposableStore();
            try {
                [original, modified] = await Promise.all([
                    r.originalUri ? this._textModelService.createModelReference(r.originalUri) : undefined,
                    r.modifiedUri ? this._textModelService.createModelReference(r.modifiedUri) : undefined,
                ]);
                if (original) {
                    multiDiffItemStore.add(original);
                }
                if (modified) {
                    multiDiffItemStore.add(modified);
                }
            }
            catch (e) {
                console.error(e);
                onUnexpectedError(e);
                return undefined;
            }
            const uri = (r.modifiedUri ?? r.originalUri);
            const result = {
                multiDiffEditorItem: r,
                original: original?.object.textEditorModel,
                modified: modified?.object.textEditorModel,
                contextKeys: r.contextKeys,
                get options() {
                    return {
                        ...getReadonlyConfiguration(modified?.object.isReadonly() ?? true),
                        ...computeOptions(textResourceConfigurationService.getValue(uri)),
                    };
                },
                onOptionsDidChange: h => this._textResourceConfigurationService.onDidChangeConfiguration(e => {
                    if (e.affectsConfiguration(uri, 'editor') || e.affectsConfiguration(uri, 'diffEditor')) {
                        h();
                    }
                }),
            };
            return store.add(RefCounted.createOfNonDisposable(result, multiDiffItemStore, this));
        }, i => JSON.stringify([i.modifiedUri?.toString(), i.originalUri?.toString()]));
        const documents = observableValue('documents', 'loading');
        const updateDocuments = derived(async (reader) => {
            const docsPromises = documentsWithPromises.read(reader);
            const docs = await Promise.all(docsPromises);
            const newDocuments = docs.filter(isDefined);
            documents.set(newDocuments, undefined);
        });
        const a = recomputeInitiallyAndOnChange(updateDocuments);
        await updateDocuments.get();
        const result = {
            dispose: () => a.dispose(),
            documents: new ValueWithChangeEventFromObservable(documents),
            contextKeys: source.source?.contextKeys,
        };
        return result;
    }
    matches(otherInput) {
        if (super.matches(otherInput)) {
            return true;
        }
        if (otherInput instanceof MultiDiffEditorInput_1) {
            return this.multiDiffSource.toString() === otherInput.multiDiffSource.toString();
        }
        return false;
    }
    isDirty() { return this._isDirtyObservable.get(); }
    async save(group, options) {
        await this.doSaveOrRevert('save', group, options);
        return this;
    }
    revert(group, options) {
        return this.doSaveOrRevert('revert', group, options);
    }
    async doSaveOrRevert(mode, group, options) {
        const items = this._viewModel.currentValue?.items.get();
        if (items) {
            await Promise.all(items.map(async (item) => {
                const model = item.diffEditorViewModel.model;
                const handleOriginal = model.original.uri.scheme !== Schemas.untitled && this._textFileService.isDirty(model.original.uri);
                await Promise.all([
                    handleOriginal ? mode === 'save' ? this._textFileService.save(model.original.uri, options) : this._textFileService.revert(model.original.uri, options) : Promise.resolve(),
                    mode === 'save' ? this._textFileService.save(model.modified.uri, options) : this._textFileService.revert(model.modified.uri, options),
                ]);
            }));
        }
        return undefined;
    }
};
MultiDiffEditorInput = MultiDiffEditorInput_1 = __decorate([
    __param(4, ITextModelService),
    __param(5, ITextResourceConfigurationService),
    __param(6, IInstantiationService),
    __param(7, IMultiDiffSourceResolverService),
    __param(8, ITextFileService),
    __metadata("design:paramtypes", [URI, Object, Object, Boolean, Object, Object, Object, Object, Object])
], MultiDiffEditorInput);
export { MultiDiffEditorInput };
class FastEventDispatcher {
    constructor(_event, _getEventArgsKey, _keyToString) {
        this._event = _event;
        this._getEventArgsKey = _getEventArgsKey;
        this._keyToString = _keyToString;
        this._count = 0;
        this._buckets = new Map();
        this._handleEventChange = (e) => {
            const key = this._getEventArgsKey(e);
            const bucket = this._buckets.get(key);
            if (bucket) {
                for (const listener of bucket) {
                    listener(e);
                }
            }
        };
    }
    filteredEvent(filter) {
        return listener => {
            const key = this._keyToString(filter);
            let bucket = this._buckets.get(key);
            if (!bucket) {
                bucket = new Set();
                this._buckets.set(key, bucket);
            }
            bucket.add(listener);
            this._count++;
            if (this._count === 1) {
                this._eventSubscription = this._event(this._handleEventChange);
            }
            return {
                dispose: () => {
                    bucket.delete(listener);
                    if (bucket.size === 0) {
                        this._buckets.delete(key);
                    }
                    this._count--;
                    if (this._count === 0) {
                        this._eventSubscription?.dispose();
                        this._eventSubscription = undefined;
                    }
                }
            };
        };
    }
}
function isUriDirty(onDidChangeDirty, textFileService, uri) {
    return observableFromEvent(onDidChangeDirty.filteredEvent(uri), () => textFileService.isDirty(uri));
}
function getReadonlyConfiguration(isReadonly) {
    return {
        readOnly: !!isReadonly,
        readOnlyMessage: typeof isReadonly !== 'boolean' ? isReadonly : undefined
    };
}
function computeOptions(configuration) {
    const editorConfiguration = deepClone(configuration.editor);
    if (isObject(configuration.diffEditor)) {
        const diffEditorConfiguration = deepClone(configuration.diffEditor);
        diffEditorConfiguration.diffCodeLens = diffEditorConfiguration.codeLens;
        delete diffEditorConfiguration.codeLens;
        diffEditorConfiguration.diffWordWrap = diffEditorConfiguration.wordWrap;
        delete diffEditorConfiguration.wordWrap;
        Object.assign(editorConfiguration, diffEditorConfiguration);
    }
    return editorConfiguration;
}
let MultiDiffEditorResolverContribution = class MultiDiffEditorResolverContribution extends Disposable {
    static { this.ID = 'workbench.contrib.multiDiffEditorResolver'; }
    constructor(editorResolverService, instantiationService) {
        super();
        this._register(editorResolverService.registerEditor(`*`, {
            id: DEFAULT_EDITOR_ASSOCIATION.id,
            label: DEFAULT_EDITOR_ASSOCIATION.displayName,
            detail: DEFAULT_EDITOR_ASSOCIATION.providerDisplayName,
            priority: RegisteredEditorPriority.builtin
        }, {}, {
            createMultiDiffEditorInput: (multiDiffEditor) => {
                return {
                    editor: MultiDiffEditorInput.fromResourceMultiDiffEditorInput(multiDiffEditor, instantiationService),
                };
            },
        }));
    }
};
MultiDiffEditorResolverContribution = __decorate([
    __param(0, IEditorResolverService),
    __param(1, IInstantiationService),
    __metadata("design:paramtypes", [Object, Object])
], MultiDiffEditorResolverContribution);
export { MultiDiffEditorResolverContribution };
export class MultiDiffEditorSerializer {
    canSerialize(editor) {
        return editor instanceof MultiDiffEditorInput && !editor.isTransient;
    }
    serialize(editor) {
        if (!this.canSerialize(editor)) {
            return undefined;
        }
        return JSON.stringify(editor.serialize());
    }
    deserialize(instantiationService, serializedEditor) {
        try {
            const data = parse(serializedEditor);
            return MultiDiffEditorInput.fromSerialized(data, instantiationService);
        }
        catch (err) {
            onUnexpectedError(err);
            return undefined;
        }
    }
}
