/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { localize } from '../../../../nls.js';
import { SyncDescriptor } from '../../../../platform/instantiation/common/descriptors.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { Extensions as ViewExtensions } from '../../../common/views.js';
import { VIEW_CONTAINER } from '../../files/browser/explorerViewlet.js';
import { ITimelineService, TimelinePaneId } from '../common/timeline.js';
import { TimelineHasProviderContext, TimelineService } from '../common/timelineService.js';
import { TimelinePane } from './timelinePane.js';
import { Extensions as ConfigurationExtensions } from '../../../../platform/configuration/common/configurationRegistry.js';
import { ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.js';
import { MenuId, MenuRegistry } from '../../../../platform/actions/common/actions.js';
import { CommandsRegistry } from '../../../../platform/commands/common/commands.js';
import { ExplorerFolderContext } from '../../files/common/files.js';
import { ResourceContextKey } from '../../../common/contextkeys.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { registerIcon } from '../../../../platform/theme/common/iconRegistry.js';
const timelineViewIcon = registerIcon('timeline-view-icon', Codicon.history, localize('timelineViewIcon', 'View icon of the timeline view.'));
const timelineOpenIcon = registerIcon('timeline-open', Codicon.history, localize('timelineOpenIcon', 'Icon for the open timeline action.'));
export class TimelinePaneDescriptor {
    constructor() {
        this.id = TimelinePaneId;
        this.name = TimelinePane.TITLE;
        this.containerIcon = timelineViewIcon;
        this.ctorDescriptor = new SyncDescriptor(TimelinePane);
        this.order = 2;
        this.weight = 30;
        this.collapsed = true;
        this.canToggleVisibility = true;
        this.hideByDefault = false;
        this.canMoveView = true;
        this.when = TimelineHasProviderContext;
        this.focusCommand = { id: 'timeline.focus' };
    }
}
// Configuration
const configurationRegistry = Registry.as(ConfigurationExtensions.Configuration);
configurationRegistry.registerConfiguration({
    id: 'timeline',
    order: 1001,
    title: localize('timelineConfigurationTitle', "Timeline"),
    type: 'object',
    properties: {
        'timeline.pageSize': {
            type: ['number', 'null'],
            default: null,
            markdownDescription: localize('timeline.pageSize', "The number of items to show in the Timeline view by default and when loading more items. Setting to `null` (the default) will automatically choose a page size based on the visible area of the Timeline view."),
        },
        'timeline.pageOnScroll': {
            type: 'boolean',
            default: false,
            description: localize('timeline.pageOnScroll', "Experimental. Controls whether the Timeline view will load the next page of items when you scroll to the end of the list."),
        },
    }
});
Registry.as(ViewExtensions.ViewsRegistry).registerViews([new TimelinePaneDescriptor()], VIEW_CONTAINER);
var OpenTimelineAction;
(function (OpenTimelineAction) {
    OpenTimelineAction.ID = 'files.openTimeline';
    OpenTimelineAction.LABEL = localize('files.openTimeline', "Open Timeline");
    function handler() {
        return (accessor, arg) => {
            const service = accessor.get(ITimelineService);
            return service.setUri(arg);
        };
    }
    OpenTimelineAction.handler = handler;
})(OpenTimelineAction || (OpenTimelineAction = {}));
CommandsRegistry.registerCommand(OpenTimelineAction.ID, OpenTimelineAction.handler());
MenuRegistry.appendMenuItem(MenuId.ExplorerContext, ({
    group: '4_timeline',
    order: 1,
    command: {
        id: OpenTimelineAction.ID,
        title: OpenTimelineAction.LABEL,
        icon: timelineOpenIcon
    },
    when: ContextKeyExpr.and(ExplorerFolderContext.toNegated(), ResourceContextKey.HasResource, TimelineHasProviderContext)
}));
const timelineFilter = registerIcon('timeline-filter', Codicon.filter, localize('timelineFilter', 'Icon for the filter timeline action.'));
MenuRegistry.appendMenuItem(MenuId.TimelineTitle, {
    submenu: MenuId.TimelineFilterSubMenu,
    title: localize('filterTimeline', "Filter Timeline"),
    group: 'navigation',
    order: 100,
    icon: timelineFilter
});
registerSingleton(ITimelineService, TimelineService, 1 /* InstantiationType.Delayed */);
