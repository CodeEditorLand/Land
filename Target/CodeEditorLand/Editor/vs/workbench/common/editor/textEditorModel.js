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
var BaseTextEditorModel_1;
import { EditorModel } from './editorModel.js';
import { URI } from '../../../base/common/uri.js';
import { ILanguageService } from '../../../editor/common/languages/language.js';
import { IModelService } from '../../../editor/common/services/model.js';
import { MutableDisposable } from '../../../base/common/lifecycle.js';
import { PLAINTEXT_LANGUAGE_ID } from '../../../editor/common/languages/modesRegistry.js';
import { ILanguageDetectionService, LanguageDetectionLanguageEventSource } from '../../services/languageDetection/common/languageDetectionWorkerService.js';
import { ThrottledDelayer } from '../../../base/common/async.js';
import { IAccessibilityService } from '../../../platform/accessibility/common/accessibility.js';
import { localize } from '../../../nls.js';
/**
 * The base text editor model leverages the code editor model. This class is only intended to be subclassed and not instantiated.
 */
let BaseTextEditorModel = class BaseTextEditorModel extends EditorModel {
    static { BaseTextEditorModel_1 = this; }
    static { this.AUTO_DETECT_LANGUAGE_THROTTLE_DELAY = 600; }
    constructor(modelService, languageService, languageDetectionService, accessibilityService, textEditorModelHandle) {
        super();
        this.modelService = modelService;
        this.languageService = languageService;
        this.languageDetectionService = languageDetectionService;
        this.accessibilityService = accessibilityService;
        this.textEditorModelHandle = undefined;
        this.modelDisposeListener = this._register(new MutableDisposable());
        this.autoDetectLanguageThrottler = this._register(new ThrottledDelayer(BaseTextEditorModel_1.AUTO_DETECT_LANGUAGE_THROTTLE_DELAY));
        this._hasLanguageSetExplicitly = false;
        if (textEditorModelHandle) {
            this.handleExistingModel(textEditorModelHandle);
        }
    }
    handleExistingModel(textEditorModelHandle) {
        // We need the resource to point to an existing model
        const model = this.modelService.getModel(textEditorModelHandle);
        if (!model) {
            throw new Error(`Document with resource ${textEditorModelHandle.toString(true)} does not exist`);
        }
        this.textEditorModelHandle = textEditorModelHandle;
        // Make sure we clean up when this model gets disposed
        this.registerModelDisposeListener(model);
    }
    registerModelDisposeListener(model) {
        this.modelDisposeListener.value = model.onWillDispose(() => {
            this.textEditorModelHandle = undefined; // make sure we do not dispose code editor model again
            this.dispose();
        });
    }
    get textEditorModel() {
        return this.textEditorModelHandle ? this.modelService.getModel(this.textEditorModelHandle) : null;
    }
    isReadonly() {
        return true;
    }
    get hasLanguageSetExplicitly() { return this._hasLanguageSetExplicitly; }
    setLanguageId(languageId, source) {
        // Remember that an explicit language was set
        this._hasLanguageSetExplicitly = true;
        this.setLanguageIdInternal(languageId, source);
    }
    setLanguageIdInternal(languageId, source) {
        if (!this.isResolved()) {
            return;
        }
        if (!languageId || languageId === this.textEditorModel.getLanguageId()) {
            return;
        }
        this.textEditorModel.setLanguage(this.languageService.createById(languageId), source);
    }
    installModelListeners(model) {
        // Setup listener for lower level language changes
        const disposable = this._register(model.onDidChangeLanguage((e) => {
            if (e.source === LanguageDetectionLanguageEventSource) {
                return;
            }
            this._hasLanguageSetExplicitly = true;
            disposable.dispose();
        }));
    }
    getLanguageId() {
        return this.textEditorModel?.getLanguageId();
    }
    autoDetectLanguage() {
        return this.autoDetectLanguageThrottler.trigger(() => this.doAutoDetectLanguage());
    }
    async doAutoDetectLanguage() {
        if (this.hasLanguageSetExplicitly || // skip detection when the user has made an explicit choice on the language
            !this.textEditorModelHandle || // require a URI to run the detection for
            !this.languageDetectionService.isEnabledForLanguage(this.getLanguageId() ?? PLAINTEXT_LANGUAGE_ID) // require a valid language that is enlisted for detection
        ) {
            return;
        }
        const lang = await this.languageDetectionService.detectLanguage(this.textEditorModelHandle);
        const prevLang = this.getLanguageId();
        if (lang && lang !== prevLang && !this.isDisposed()) {
            this.setLanguageIdInternal(lang, LanguageDetectionLanguageEventSource);
            const languageName = this.languageService.getLanguageName(lang);
            this.accessibilityService.alert(localize('languageAutoDetected', "Language {0} was automatically detected and set as the language mode.", languageName ?? lang));
        }
    }
    /**
     * Creates the text editor model with the provided value, optional preferred language
     * (can be comma separated for multiple values) and optional resource URL.
     */
    createTextEditorModel(value, resource, preferredLanguageId) {
        const firstLineText = this.getFirstLineText(value);
        const languageSelection = this.getOrCreateLanguage(resource, this.languageService, preferredLanguageId, firstLineText);
        return this.doCreateTextEditorModel(value, languageSelection, resource);
    }
    doCreateTextEditorModel(value, languageSelection, resource) {
        let model = resource && this.modelService.getModel(resource);
        if (!model) {
            model = this.modelService.createModel(value, languageSelection, resource);
            this.createdEditorModel = true;
            // Make sure we clean up when this model gets disposed
            this.registerModelDisposeListener(model);
        }
        else {
            this.updateTextEditorModel(value, languageSelection.languageId);
        }
        this.textEditorModelHandle = model.uri;
        return model;
    }
    getFirstLineText(value) {
        // text buffer factory
        const textBufferFactory = value;
        if (typeof textBufferFactory.getFirstLineText === 'function') {
            return textBufferFactory.getFirstLineText(1000 /* ModelConstants.FIRST_LINE_DETECTION_LENGTH_LIMIT */);
        }
        // text model
        const textSnapshot = value;
        return textSnapshot.getLineContent(1).substr(0, 1000 /* ModelConstants.FIRST_LINE_DETECTION_LENGTH_LIMIT */);
    }
    /**
     * Gets the language for the given identifier. Subclasses can override to provide their own implementation of this lookup.
     *
     * @param firstLineText optional first line of the text buffer to set the language on. This can be used to guess a language from content.
     */
    getOrCreateLanguage(resource, languageService, preferredLanguage, firstLineText) {
        // lookup language via resource path if the provided language is unspecific
        if (!preferredLanguage || preferredLanguage === PLAINTEXT_LANGUAGE_ID) {
            return languageService.createByFilepathOrFirstLine(resource ?? null, firstLineText);
        }
        // otherwise take the preferred language for granted
        return languageService.createById(preferredLanguage);
    }
    /**
     * Updates the text editor model with the provided value. If the value is the same as the model has, this is a no-op.
     */
    updateTextEditorModel(newValue, preferredLanguageId) {
        if (!this.isResolved()) {
            return;
        }
        // contents
        if (newValue) {
            this.modelService.updateModel(this.textEditorModel, newValue);
        }
        // language (only if specific and changed)
        if (preferredLanguageId && preferredLanguageId !== PLAINTEXT_LANGUAGE_ID && this.textEditorModel.getLanguageId() !== preferredLanguageId) {
            this.textEditorModel.setLanguage(this.languageService.createById(preferredLanguageId));
        }
    }
    createSnapshot() {
        if (!this.textEditorModel) {
            return null;
        }
        return this.textEditorModel.createSnapshot(true /* preserve BOM */);
    }
    isResolved() {
        return !!this.textEditorModelHandle;
    }
    dispose() {
        this.modelDisposeListener.dispose(); // dispose this first because it will trigger another dispose() otherwise
        if (this.textEditorModelHandle && this.createdEditorModel) {
            this.modelService.destroyModel(this.textEditorModelHandle);
        }
        this.textEditorModelHandle = undefined;
        this.createdEditorModel = false;
        super.dispose();
    }
};
BaseTextEditorModel = BaseTextEditorModel_1 = __decorate([
    __param(0, IModelService),
    __param(1, ILanguageService),
    __param(2, ILanguageDetectionService),
    __param(3, IAccessibilityService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, URI])
], BaseTextEditorModel);
export { BaseTextEditorModel };
