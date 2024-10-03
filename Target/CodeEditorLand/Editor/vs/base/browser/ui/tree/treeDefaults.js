import { Action } from '../../../common/actions.js';
import * as nls from '../../../../nls.js';
export class CollapseAllAction extends Action {
    constructor(viewer, enabled) {
        super('vs.tree.collapse', nls.localize('collapse all', "Collapse All"), 'collapse-all', enabled);
        this.viewer = viewer;
    }
    async run() {
        this.viewer.collapseAll();
        this.viewer.setSelection([]);
        this.viewer.setFocus([]);
    }
}
