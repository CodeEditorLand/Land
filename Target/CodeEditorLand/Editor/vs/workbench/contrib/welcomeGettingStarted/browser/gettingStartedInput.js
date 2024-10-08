/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import './media/gettingStarted.css';
import { localize } from '../../../../nls.js';
import { EditorInput } from '../../../common/editor/editorInput.js';
import { URI } from '../../../../base/common/uri.js';
import { Schemas } from '../../../../base/common/network.js';
export const gettingStartedInputTypeId = 'workbench.editors.gettingStartedInput';
export class GettingStartedInput extends EditorInput {
    static { this.ID = gettingStartedInputTypeId; }
    static { this.RESOURCE = URI.from({ scheme: Schemas.walkThrough, authority: 'vscode_getting_started_page' }); }
    get typeId() {
        return GettingStartedInput.ID;
    }
    get editorId() {
        return this.typeId;
    }
    toUntyped() {
        return {
            resource: GettingStartedInput.RESOURCE,
            options: {
                override: GettingStartedInput.ID,
                pinned: false
            }
        };
    }
    get resource() {
        return GettingStartedInput.RESOURCE;
    }
    matches(other) {
        if (super.matches(other)) {
            return true;
        }
        if (other instanceof GettingStartedInput) {
            return other.selectedCategory === this.selectedCategory;
        }
        return false;
    }
    constructor(options) {
        super();
        this.selectedCategory = options.selectedCategory;
        this.selectedStep = options.selectedStep;
        this.showTelemetryNotice = !!options.showTelemetryNotice;
        this.showWelcome = options.showWelcome ?? true;
    }
    getName() {
        return localize('getStarted', "Welcome");
    }
}
