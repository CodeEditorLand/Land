/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Disposable } from '../../../../base/common/lifecycle.js';
export class ExtensionRecommendations extends Disposable {
    constructor() {
        super(...arguments);
        this._activationPromise = null;
    }
    get activated() { return this._activationPromise !== null; }
    activate() {
        if (!this._activationPromise) {
            this._activationPromise = this.doActivate();
        }
        return this._activationPromise;
    }
}
