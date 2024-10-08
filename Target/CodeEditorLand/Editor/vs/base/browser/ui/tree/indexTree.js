/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { AbstractTree } from './abstractTree.js';
import { IndexTreeModel } from './indexTreeModel.js';
import { TreeError } from './tree.js';
import { Iterable } from '../../../common/iterator.js';
import './media/tree.css';
export class IndexTree extends AbstractTree {
    constructor(user, container, delegate, renderers, rootElement, options = {}) {
        super(user, container, delegate, renderers, options);
        this.user = user;
        this.rootElement = rootElement;
    }
    splice(location, deleteCount, toInsert = Iterable.empty()) {
        this.model.splice(location, deleteCount, toInsert);
    }
    rerender(location) {
        if (location === undefined) {
            this.view.rerender();
            return;
        }
        this.model.rerender(location);
    }
    updateElementHeight(location, height) {
        if (location.length === 0) {
            throw new TreeError(this.user, `Update element height failed: invalid location`);
        }
        const elementIndex = this.model.getListIndex(location);
        if (elementIndex === -1) {
            return;
        }
        this.view.updateElementHeight(elementIndex, height);
    }
    createModel(user, options) {
        return new IndexTreeModel(user, this.rootElement, options);
    }
}
