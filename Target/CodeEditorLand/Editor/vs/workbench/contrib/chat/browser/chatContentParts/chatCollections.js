/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Disposable } from '../../../../../base/common/lifecycle.js';
export class ResourcePool extends Disposable {
    get inUse() {
        return this._inUse;
    }
    constructor(_itemFactory) {
        super();
        this._itemFactory = _itemFactory;
        this.pool = [];
        this._inUse = new Set;
    }
    get() {
        if (this.pool.length > 0) {
            const item = this.pool.pop();
            this._inUse.add(item);
            return item;
        }
        const item = this._register(this._itemFactory());
        this._inUse.add(item);
        return item;
    }
    release(item) {
        this._inUse.delete(item);
        this.pool.push(item);
    }
}
