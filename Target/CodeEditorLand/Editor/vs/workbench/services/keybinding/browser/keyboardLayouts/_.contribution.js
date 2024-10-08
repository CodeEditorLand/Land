/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export class KeyboardLayoutContribution {
    static { this.INSTANCE = new KeyboardLayoutContribution(); }
    get layoutInfos() {
        return this._layoutInfos;
    }
    constructor() {
        this._layoutInfos = [];
    }
    registerKeyboardLayout(layout) {
        this._layoutInfos.push(layout);
    }
}
