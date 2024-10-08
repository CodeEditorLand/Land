/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { reset } from '../../dom.js';
import { getBaseLayerHoverDelegate } from '../hover/hoverDelegate2.js';
import { getDefaultHoverDelegate } from '../hover/hoverDelegateFactory.js';
import { renderLabelWithIcons } from './iconLabels.js';
export class SimpleIconLabel {
    constructor(_container) {
        this._container = _container;
    }
    set text(text) {
        reset(this._container, ...renderLabelWithIcons(text ?? ''));
    }
    set title(title) {
        if (!this.hover && title) {
            this.hover = getBaseLayerHoverDelegate().setupManagedHover(getDefaultHoverDelegate('mouse'), this._container, title);
        }
        else if (this.hover) {
            this.hover.update(title);
        }
    }
    dispose() {
        this.hover?.dispose();
    }
}
