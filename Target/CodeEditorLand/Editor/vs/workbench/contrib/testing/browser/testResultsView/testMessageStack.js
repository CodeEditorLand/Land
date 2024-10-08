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
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { CallStackFrame, CallStackWidget } from '../../../debug/browser/callStackWidget.js';
let TestResultStackWidget = class TestResultStackWidget extends Disposable {
    get onDidScroll() {
        return this.widget.onDidScroll;
    }
    constructor(container, containingEditor, instantiationService) {
        super();
        this.container = container;
        this.widget = this._register(instantiationService.createInstance(CallStackWidget, container, containingEditor));
    }
    collapseAll() {
        this.widget.collapseAll();
    }
    update(messageFrame, stack) {
        this.widget.setFrames([messageFrame, ...stack.map(frame => new CallStackFrame(frame.label, frame.uri, frame.position?.lineNumber, frame.position?.column))]);
    }
    layout(height, width) {
        this.widget.layout(height ?? this.container.clientHeight, width);
    }
};
TestResultStackWidget = __decorate([
    __param(2, IInstantiationService),
    __metadata("design:paramtypes", [HTMLElement, Object, Object])
], TestResultStackWidget);
export { TestResultStackWidget };
