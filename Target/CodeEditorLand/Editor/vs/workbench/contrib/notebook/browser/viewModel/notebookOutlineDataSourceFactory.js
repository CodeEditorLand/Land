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
import { ReferenceCollection } from '../../../../../base/common/lifecycle.js';
import { IInstantiationService, createDecorator } from '../../../../../platform/instantiation/common/instantiation.js';
import { NotebookCellOutlineDataSource } from './notebookOutlineDataSource.js';
let NotebookCellOutlineDataSourceReferenceCollection = class NotebookCellOutlineDataSourceReferenceCollection extends ReferenceCollection {
    constructor(instantiationService) {
        super();
        this.instantiationService = instantiationService;
    }
    createReferencedObject(_key, editor) {
        return this.instantiationService.createInstance(NotebookCellOutlineDataSource, editor);
    }
    destroyReferencedObject(_key, object) {
        object.dispose();
    }
};
NotebookCellOutlineDataSourceReferenceCollection = __decorate([
    __param(0, IInstantiationService),
    __metadata("design:paramtypes", [Object])
], NotebookCellOutlineDataSourceReferenceCollection);
export const INotebookCellOutlineDataSourceFactory = createDecorator('INotebookCellOutlineDataSourceFactory');
let NotebookCellOutlineDataSourceFactory = class NotebookCellOutlineDataSourceFactory {
    constructor(instantiationService) {
        this._data = instantiationService.createInstance(NotebookCellOutlineDataSourceReferenceCollection);
    }
    getOrCreate(editor) {
        return this._data.acquire(editor.getId(), editor);
    }
};
NotebookCellOutlineDataSourceFactory = __decorate([
    __param(0, IInstantiationService),
    __metadata("design:paramtypes", [Object])
], NotebookCellOutlineDataSourceFactory);
export { NotebookCellOutlineDataSourceFactory };
