import { Emitter, Event } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { LanguagesRegistry } from './languagesRegistry.js';
import { TokenizationRegistry } from '../languages.js';
import { PLAINTEXT_LANGUAGE_ID } from '../languages/modesRegistry.js';
import { observableFromEvent } from '../../../base/common/observable.js';
export class LanguageService extends Disposable {
    static { this.instanceCount = 0; }
    constructor(warnOnOverwrite = false) {
        super();
        this._onDidRequestBasicLanguageFeatures = this._register(new Emitter());
        this.onDidRequestBasicLanguageFeatures = this._onDidRequestBasicLanguageFeatures.event;
        this._onDidRequestRichLanguageFeatures = this._register(new Emitter());
        this.onDidRequestRichLanguageFeatures = this._onDidRequestRichLanguageFeatures.event;
        this._onDidChange = this._register(new Emitter({ leakWarningThreshold: 200 }));
        this.onDidChange = this._onDidChange.event;
        this._requestedBasicLanguages = new Set();
        this._requestedRichLanguages = new Set();
        LanguageService.instanceCount++;
        this._registry = this._register(new LanguagesRegistry(true, warnOnOverwrite));
        this.languageIdCodec = this._registry.languageIdCodec;
        this._register(this._registry.onDidChange(() => this._onDidChange.fire()));
    }
    dispose() {
        LanguageService.instanceCount--;
        super.dispose();
    }
    registerLanguage(def) {
        return this._registry.registerLanguage(def);
    }
    isRegisteredLanguageId(languageId) {
        return this._registry.isRegisteredLanguageId(languageId);
    }
    getRegisteredLanguageIds() {
        return this._registry.getRegisteredLanguageIds();
    }
    getSortedRegisteredLanguageNames() {
        return this._registry.getSortedRegisteredLanguageNames();
    }
    getLanguageName(languageId) {
        return this._registry.getLanguageName(languageId);
    }
    getMimeType(languageId) {
        return this._registry.getMimeType(languageId);
    }
    getIcon(languageId) {
        return this._registry.getIcon(languageId);
    }
    getExtensions(languageId) {
        return this._registry.getExtensions(languageId);
    }
    getFilenames(languageId) {
        return this._registry.getFilenames(languageId);
    }
    getConfigurationFiles(languageId) {
        return this._registry.getConfigurationFiles(languageId);
    }
    getLanguageIdByLanguageName(languageName) {
        return this._registry.getLanguageIdByLanguageName(languageName);
    }
    getLanguageIdByMimeType(mimeType) {
        return this._registry.getLanguageIdByMimeType(mimeType);
    }
    guessLanguageIdByFilepathOrFirstLine(resource, firstLine) {
        const languageIds = this._registry.guessLanguageIdByFilepathOrFirstLine(resource, firstLine);
        return languageIds.at(0) ?? null;
    }
    createById(languageId) {
        return new LanguageSelection(this.onDidChange, () => {
            return this._createAndGetLanguageIdentifier(languageId);
        });
    }
    createByMimeType(mimeType) {
        return new LanguageSelection(this.onDidChange, () => {
            const languageId = this.getLanguageIdByMimeType(mimeType);
            return this._createAndGetLanguageIdentifier(languageId);
        });
    }
    createByFilepathOrFirstLine(resource, firstLine) {
        return new LanguageSelection(this.onDidChange, () => {
            const languageId = this.guessLanguageIdByFilepathOrFirstLine(resource, firstLine);
            return this._createAndGetLanguageIdentifier(languageId);
        });
    }
    _createAndGetLanguageIdentifier(languageId) {
        if (!languageId || !this.isRegisteredLanguageId(languageId)) {
            languageId = PLAINTEXT_LANGUAGE_ID;
        }
        return languageId;
    }
    requestBasicLanguageFeatures(languageId) {
        if (!this._requestedBasicLanguages.has(languageId)) {
            this._requestedBasicLanguages.add(languageId);
            this._onDidRequestBasicLanguageFeatures.fire(languageId);
        }
    }
    requestRichLanguageFeatures(languageId) {
        if (!this._requestedRichLanguages.has(languageId)) {
            this._requestedRichLanguages.add(languageId);
            this.requestBasicLanguageFeatures(languageId);
            TokenizationRegistry.getOrCreate(languageId);
            this._onDidRequestRichLanguageFeatures.fire(languageId);
        }
    }
}
class LanguageSelection {
    constructor(onDidChangeLanguages, selector) {
        this._value = observableFromEvent(this, onDidChangeLanguages, () => selector());
        this.onDidChange = Event.fromObservable(this._value);
    }
    get languageId() {
        return this._value.get();
    }
}
