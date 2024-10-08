/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
export const IStatusbarService = createDecorator('statusbarService');
export function isStatusbarEntryLocation(thing) {
    const candidate = thing;
    return typeof candidate?.id === 'string' && typeof candidate.alignment === 'number';
}
export function isStatusbarEntryPriority(thing) {
    const candidate = thing;
    return (typeof candidate?.primary === 'number' || isStatusbarEntryLocation(candidate?.primary)) && typeof candidate?.secondary === 'number';
}
export const ShowTooltipCommand = {
    id: 'statusBar.entry.showTooltip',
    title: ''
};
export const StatusbarEntryKinds = ['standard', 'warning', 'error', 'prominent', 'remote', 'offline'];
