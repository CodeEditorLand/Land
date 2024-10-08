/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { CellFocusMode } from '../notebookBrowser.js';
import { CellKind, NotebookCellExecutionState, NotebookSetting } from '../../common/notebookCommon.js';
export class NotebookCellAnchor {
    constructor(notebookExecutionStateService, configurationService, scrollEvent) {
        this.notebookExecutionStateService = notebookExecutionStateService;
        this.configurationService = configurationService;
        this.scrollEvent = scrollEvent;
        this.stopAnchoring = false;
    }
    shouldAnchor(cellListView, focusedIndex, heightDelta, executingCellUri) {
        if (cellListView.element(focusedIndex).focusMode === CellFocusMode.Editor) {
            return true;
        }
        if (this.stopAnchoring) {
            return false;
        }
        const newFocusBottom = cellListView.elementTop(focusedIndex) + cellListView.elementHeight(focusedIndex) + heightDelta;
        const viewBottom = cellListView.renderHeight + cellListView.getScrollTop();
        const focusStillVisible = viewBottom > newFocusBottom;
        const allowScrolling = this.configurationService.getValue(NotebookSetting.scrollToRevealCell) !== 'none';
        const growing = heightDelta > 0;
        const autoAnchor = allowScrolling && growing && !focusStillVisible;
        if (autoAnchor) {
            this.watchAchorDuringExecution(executingCellUri);
            return true;
        }
        return false;
    }
    watchAchorDuringExecution(executingCell) {
        // anchor while the cell is executing unless the user scrolls up.
        if (!this.executionWatcher && executingCell.cellKind === CellKind.Code) {
            const executionState = this.notebookExecutionStateService.getCellExecution(executingCell.uri);
            if (executionState && executionState.state === NotebookCellExecutionState.Executing) {
                this.executionWatcher = executingCell.onDidStopExecution(() => {
                    this.executionWatcher?.dispose();
                    this.executionWatcher = undefined;
                    this.scrollWatcher?.dispose();
                    this.stopAnchoring = false;
                });
                this.scrollWatcher = this.scrollEvent((scrollEvent) => {
                    if (scrollEvent.scrollTop < scrollEvent.oldScrollTop) {
                        this.stopAnchoring = true;
                        this.scrollWatcher?.dispose();
                    }
                });
            }
        }
    }
    dispose() {
        this.executionWatcher?.dispose();
        this.scrollWatcher?.dispose();
    }
}
