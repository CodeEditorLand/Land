/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { StandardMouseEvent } from '../../../../base/browser/mouseEvent.js';
import { ActionRunner } from '../../../../base/common/actions.js';
import { asArray } from '../../../../base/common/arrays.js';
import { createAndFillInContextMenuActions } from '../../../../platform/actions/browser/menuEntryActionViewItem.js';
/**
 * A context that is passed to actions as arguments to represent the terminal instance(s) being
 * acted upon.
 */
export class InstanceContext {
    constructor(instance) {
        // Only store the instance to avoid contexts holding on to disposed instances.
        this.instanceId = instance.instanceId;
    }
    toJSON() {
        return {
            $mid: 15 /* MarshalledId.TerminalContext */,
            instanceId: this.instanceId
        };
    }
}
export class TerminalContextActionRunner extends ActionRunner {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    async runAction(action, context) {
        if (Array.isArray(context) && context.every(e => e instanceof InstanceContext)) {
            // arg1: The (first) focused instance
            // arg2: All selected instances
            await action.run(context?.[0], context);
            return;
        }
        return super.runAction(action, context);
    }
}
export function openContextMenu(targetWindow, event, contextInstances, menu, contextMenuService, extraActions) {
    const standardEvent = new StandardMouseEvent(targetWindow, event);
    const actions = [];
    createAndFillInContextMenuActions(menu, { shouldForwardArgs: true }, actions);
    if (extraActions) {
        actions.push(...extraActions);
    }
    const context = contextInstances ? asArray(contextInstances).map(e => new InstanceContext(e)) : [];
    contextMenuService.showContextMenu({
        actionRunner: new TerminalContextActionRunner(),
        getAnchor: () => standardEvent,
        getActions: () => actions,
        getActionsContext: () => context,
    });
}
