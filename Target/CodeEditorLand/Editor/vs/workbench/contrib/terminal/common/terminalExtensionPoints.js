/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as extensionsRegistry from '../../../services/extensions/common/extensionsRegistry.js';
import { terminalContributionsDescriptor } from './terminal.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { URI } from '../../../../base/common/uri.js';
// terminal extension point
const terminalsExtPoint = extensionsRegistry.ExtensionsRegistry.registerExtensionPoint(terminalContributionsDescriptor);
export const ITerminalContributionService = createDecorator('terminalContributionsService');
export class TerminalContributionService {
    get terminalProfiles() { return this._terminalProfiles; }
    constructor() {
        this._terminalProfiles = [];
        terminalsExtPoint.setHandler(contributions => {
            this._terminalProfiles = contributions.map(c => {
                return c.value?.profiles?.filter(p => hasValidTerminalIcon(p)).map(e => {
                    return { ...e, extensionIdentifier: c.description.identifier.value };
                }) || [];
            }).flat();
        });
    }
}
function hasValidTerminalIcon(profile) {
    return !profile.icon ||
        (typeof profile.icon === 'string' ||
            URI.isUri(profile.icon) ||
            ('light' in profile.icon && 'dark' in profile.icon &&
                URI.isUri(profile.icon.light) && URI.isUri(profile.icon.dark)));
}
