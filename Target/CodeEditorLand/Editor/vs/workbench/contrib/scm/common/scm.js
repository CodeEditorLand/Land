/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
export const VIEWLET_ID = 'workbench.view.scm';
export const VIEW_PANE_ID = 'workbench.scm';
export const REPOSITORIES_VIEW_PANE_ID = 'workbench.scm.repositories';
export const HISTORY_VIEW_PANE_ID = 'workbench.scm.history';
export const ISCMService = createDecorator('scm');
export var SCMInputChangeReason;
(function (SCMInputChangeReason) {
    SCMInputChangeReason[SCMInputChangeReason["HistoryPrevious"] = 0] = "HistoryPrevious";
    SCMInputChangeReason[SCMInputChangeReason["HistoryNext"] = 1] = "HistoryNext";
})(SCMInputChangeReason || (SCMInputChangeReason = {}));
export const ISCMViewService = createDecorator('scmView');
export const SCM_CHANGES_EDITOR_ID = 'workbench.editor.scmChangesEditor';
