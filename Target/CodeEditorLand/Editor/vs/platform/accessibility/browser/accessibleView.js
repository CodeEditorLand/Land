/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { createDecorator } from '../../instantiation/common/instantiation.js';
import { Disposable } from '../../../base/common/lifecycle.js';
export const IAccessibleViewService = createDecorator('accessibleViewService');
export class AccessibleContentProvider extends Disposable {
    constructor(id, options, provideContent, onClose, verbositySettingKey, onOpen, actions, provideNextContent, providePreviousContent, onDidChangeContent, onKeyDown, getSymbols, onDidRequestClearLastProvider) {
        super();
        this.id = id;
        this.options = options;
        this.provideContent = provideContent;
        this.onClose = onClose;
        this.verbositySettingKey = verbositySettingKey;
        this.onOpen = onOpen;
        this.actions = actions;
        this.provideNextContent = provideNextContent;
        this.providePreviousContent = providePreviousContent;
        this.onDidChangeContent = onDidChangeContent;
        this.onKeyDown = onKeyDown;
        this.getSymbols = getSymbols;
        this.onDidRequestClearLastProvider = onDidRequestClearLastProvider;
    }
}
export class ExtensionContentProvider extends Disposable {
    constructor(id, options, provideContent, onClose, onOpen, provideNextContent, providePreviousContent, actions, onDidChangeContent) {
        super();
        this.id = id;
        this.options = options;
        this.provideContent = provideContent;
        this.onClose = onClose;
        this.onOpen = onOpen;
        this.provideNextContent = provideNextContent;
        this.providePreviousContent = providePreviousContent;
        this.actions = actions;
        this.onDidChangeContent = onDidChangeContent;
    }
}
