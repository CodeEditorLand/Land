/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { IModelService } from '../../../../editor/common/services/model.js';
import { ILanguageService } from '../../../../editor/common/languages/language.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { parseSavedSearchEditor, parseSerializedSearchEditor } from './searchEditorSerialization.js';
import { IWorkingCopyBackupService } from '../../../services/workingCopy/common/workingCopyBackup.js';
import { assertIsDefined } from '../../../../base/common/types.js';
import { createTextBufferFactoryFromStream } from '../../../../editor/common/model/textModel.js';
import { SearchEditorWorkingCopyTypeId } from './constants.js';
import { Emitter } from '../../../../base/common/event.js';
import { ResourceMap } from '../../../../base/common/map.js';
import { SEARCH_RESULT_LANGUAGE_ID } from '../../../services/search/common/search.js';
export class SearchConfigurationModel {
    constructor(config) {
        this.config = config;
        this._onConfigDidUpdate = new Emitter();
        this.onConfigDidUpdate = this._onConfigDidUpdate.event;
    }
    updateConfig(config) { this.config = config; this._onConfigDidUpdate.fire(config); }
}
export class SearchEditorModel {
    constructor(resource) {
        this.resource = resource;
    }
    async resolve() {
        return assertIsDefined(searchEditorModelFactory.models.get(this.resource)).resolve();
    }
}
class SearchEditorModelFactory {
    constructor() {
        this.models = new ResourceMap();
    }
    initializeModelFromExistingModel(accessor, resource, config) {
        if (this.models.has(resource)) {
            throw Error('Unable to contruct model for resource that already exists');
        }
        const languageService = accessor.get(ILanguageService);
        const modelService = accessor.get(IModelService);
        const instantiationService = accessor.get(IInstantiationService);
        const workingCopyBackupService = accessor.get(IWorkingCopyBackupService);
        let ongoingResolve;
        this.models.set(resource, {
            resolve: () => {
                if (!ongoingResolve) {
                    ongoingResolve = (async () => {
                        const backup = await this.tryFetchModelFromBackupService(resource, languageService, modelService, workingCopyBackupService, instantiationService);
                        if (backup) {
                            return backup;
                        }
                        return Promise.resolve({
                            resultsModel: modelService.getModel(resource) ?? modelService.createModel('', languageService.createById(SEARCH_RESULT_LANGUAGE_ID), resource),
                            configurationModel: new SearchConfigurationModel(config)
                        });
                    })();
                }
                return ongoingResolve;
            }
        });
    }
    initializeModelFromRawData(accessor, resource, config, contents) {
        if (this.models.has(resource)) {
            throw Error('Unable to contruct model for resource that already exists');
        }
        const languageService = accessor.get(ILanguageService);
        const modelService = accessor.get(IModelService);
        const instantiationService = accessor.get(IInstantiationService);
        const workingCopyBackupService = accessor.get(IWorkingCopyBackupService);
        let ongoingResolve;
        this.models.set(resource, {
            resolve: () => {
                if (!ongoingResolve) {
                    ongoingResolve = (async () => {
                        const backup = await this.tryFetchModelFromBackupService(resource, languageService, modelService, workingCopyBackupService, instantiationService);
                        if (backup) {
                            return backup;
                        }
                        return Promise.resolve({
                            resultsModel: modelService.createModel(contents ?? '', languageService.createById(SEARCH_RESULT_LANGUAGE_ID), resource),
                            configurationModel: new SearchConfigurationModel(config)
                        });
                    })();
                }
                return ongoingResolve;
            }
        });
    }
    initializeModelFromExistingFile(accessor, resource, existingFile) {
        if (this.models.has(resource)) {
            throw Error('Unable to contruct model for resource that already exists');
        }
        const languageService = accessor.get(ILanguageService);
        const modelService = accessor.get(IModelService);
        const instantiationService = accessor.get(IInstantiationService);
        const workingCopyBackupService = accessor.get(IWorkingCopyBackupService);
        let ongoingResolve;
        this.models.set(resource, {
            resolve: async () => {
                if (!ongoingResolve) {
                    ongoingResolve = (async () => {
                        const backup = await this.tryFetchModelFromBackupService(resource, languageService, modelService, workingCopyBackupService, instantiationService);
                        if (backup) {
                            return backup;
                        }
                        const { text, config } = await instantiationService.invokeFunction(parseSavedSearchEditor, existingFile);
                        return ({
                            resultsModel: modelService.createModel(text ?? '', languageService.createById(SEARCH_RESULT_LANGUAGE_ID), resource),
                            configurationModel: new SearchConfigurationModel(config)
                        });
                    })();
                }
                return ongoingResolve;
            }
        });
    }
    async tryFetchModelFromBackupService(resource, languageService, modelService, workingCopyBackupService, instantiationService) {
        const backup = await workingCopyBackupService.resolve({ resource, typeId: SearchEditorWorkingCopyTypeId });
        let model = modelService.getModel(resource);
        if (!model && backup) {
            const factory = await createTextBufferFactoryFromStream(backup.value);
            model = modelService.createModel(factory, languageService.createById(SEARCH_RESULT_LANGUAGE_ID), resource);
        }
        if (model) {
            const existingFile = model.getValue();
            const { text, config } = parseSerializedSearchEditor(existingFile);
            modelService.destroyModel(resource);
            return ({
                resultsModel: modelService.createModel(text ?? '', languageService.createById(SEARCH_RESULT_LANGUAGE_ID), resource),
                configurationModel: new SearchConfigurationModel(config)
            });
        }
        else {
            return undefined;
        }
    }
}
export const searchEditorModelFactory = new SearchEditorModelFactory();
