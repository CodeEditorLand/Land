/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { AbstractRuntimeExtensionsEditor } from './abstractRuntimeExtensionsEditor.js';
import { ReportExtensionIssueAction } from '../common/reportExtensionIssueAction.js';
export class RuntimeExtensionsEditor extends AbstractRuntimeExtensionsEditor {
    _getProfileInfo() {
        return null;
    }
    _getUnresponsiveProfile(extensionId) {
        return undefined;
    }
    _createSlowExtensionAction(element) {
        return null;
    }
    _createReportExtensionIssueAction(element) {
        if (element.marketplaceInfo) {
            return this._instantiationService.createInstance(ReportExtensionIssueAction, element.description);
        }
        return null;
    }
}
