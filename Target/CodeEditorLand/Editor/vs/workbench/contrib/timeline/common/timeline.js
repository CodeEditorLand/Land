import { ExtensionIdentifier } from '../../../../platform/extensions/common/extensions.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
export function toKey(extension, source) {
    return `${typeof extension === 'string' ? extension : ExtensionIdentifier.toKey(extension)}|${source}`;
}
export const TimelinePaneId = 'timeline';
const TIMELINE_SERVICE_ID = 'timeline';
export const ITimelineService = createDecorator(TIMELINE_SERVICE_ID);
