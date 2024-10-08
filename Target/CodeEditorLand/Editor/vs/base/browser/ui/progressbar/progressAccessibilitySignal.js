/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const nullScopedAccessibilityProgressSignalFactory = () => ({
    msLoopTime: -1,
    msDelayTime: -1,
    dispose: () => { },
});
let progressAccessibilitySignalSchedulerFactory = nullScopedAccessibilityProgressSignalFactory;
export function setProgressAcccessibilitySignalScheduler(progressAccessibilitySignalScheduler) {
    progressAccessibilitySignalSchedulerFactory = progressAccessibilitySignalScheduler;
}
export function getProgressAcccessibilitySignalScheduler(msDelayTime, msLoopTime) {
    return progressAccessibilitySignalSchedulerFactory(msDelayTime, msLoopTime);
}
