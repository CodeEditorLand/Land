import { basename, isAbsolute, join } from '../../../base/common/path.js';
import { createDecorator } from '../../instantiation/common/instantiation.js';
export const IV8InspectProfilingService = createDecorator('IV8InspectProfilingService');
export var Utils;
(function (Utils) {
    function isValidProfile(profile) {
        return Boolean(profile.samples && profile.timeDeltas);
    }
    Utils.isValidProfile = isValidProfile;
    function rewriteAbsolutePaths(profile, replace = 'noAbsolutePaths') {
        for (const node of profile.nodes) {
            if (node.callFrame && node.callFrame.url) {
                if (isAbsolute(node.callFrame.url) || /^\w[\w\d+.-]*:\/\/\/?/.test(node.callFrame.url)) {
                    node.callFrame.url = join(replace, basename(node.callFrame.url));
                }
            }
        }
        return profile;
    }
    Utils.rewriteAbsolutePaths = rewriteAbsolutePaths;
})(Utils || (Utils = {}));
