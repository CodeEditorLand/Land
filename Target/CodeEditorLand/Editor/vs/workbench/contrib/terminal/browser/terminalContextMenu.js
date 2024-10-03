import { StandardMouseEvent } from '../../../../base/browser/mouseEvent.js';
import { ActionRunner } from '../../../../base/common/actions.js';
import { asArray } from '../../../../base/common/arrays.js';
import { createAndFillInContextMenuActions } from '../../../../platform/actions/browser/menuEntryActionViewItem.js';
export class InstanceContext {
    constructor(instance) {
        this.instanceId = instance.instanceId;
    }
    toJSON() {
        return {
            $mid: 15,
            instanceId: this.instanceId
        };
    }
}
export class TerminalContextActionRunner extends ActionRunner {
    async runAction(action, context) {
        if (Array.isArray(context) && context.every(e => e instanceof InstanceContext)) {
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
