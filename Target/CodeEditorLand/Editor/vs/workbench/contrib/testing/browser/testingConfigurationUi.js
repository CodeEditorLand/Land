/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { groupBy } from '../../../../base/common/arrays.js';
import { isDefined } from '../../../../base/common/types.js';
import { localize } from '../../../../nls.js';
import { CommandsRegistry } from '../../../../platform/commands/common/commands.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { testingUpdateProfiles } from './icons.js';
import { testConfigurationGroupNames } from '../common/constants.js';
import { canUseProfileWithTest, ITestProfileService } from '../common/testProfileService.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
function buildPicker(accessor, { onlyGroup, showConfigureButtons = true, onlyForTest, onlyConfigurable, placeholder = localize('testConfigurationUi.pick', 'Pick a test profile to use'), }) {
    const profileService = accessor.get(ITestProfileService);
    const items = [];
    const pushItems = (allProfiles, description) => {
        for (const profiles of groupBy(allProfiles, (a, b) => a.group - b.group)) {
            let addedHeader = false;
            if (onlyGroup) {
                if (profiles[0].group !== onlyGroup) {
                    continue;
                }
                addedHeader = true; // showing one group, no need for label
            }
            for (const profile of profiles) {
                if (onlyConfigurable && !profile.hasConfigurationHandler) {
                    continue;
                }
                if (!addedHeader) {
                    items.push({ type: 'separator', label: testConfigurationGroupNames[profiles[0].group] });
                    addedHeader = true;
                }
                items.push(({
                    type: 'item',
                    profile,
                    label: profile.label,
                    description,
                    alwaysShow: true,
                    buttons: profile.hasConfigurationHandler && showConfigureButtons
                        ? [{
                                iconClass: ThemeIcon.asClassName(testingUpdateProfiles),
                                tooltip: localize('updateTestConfiguration', 'Update Test Configuration')
                            }] : []
                }));
            }
        }
    };
    if (onlyForTest !== undefined) {
        pushItems(profileService.getControllerProfiles(onlyForTest.controllerId).filter(p => canUseProfileWithTest(p, onlyForTest)));
    }
    else {
        for (const { profiles, controller } of profileService.all()) {
            pushItems(profiles, controller.label.get());
        }
    }
    const quickpick = accessor.get(IQuickInputService).createQuickPick({ useSeparators: true });
    quickpick.items = items;
    quickpick.placeholder = placeholder;
    return quickpick;
}
const triggerButtonHandler = (service, resolve) => (evt) => {
    const profile = evt.item.profile;
    if (profile) {
        service.configure(profile.controllerId, profile.profileId);
        resolve(undefined);
    }
};
CommandsRegistry.registerCommand({
    id: 'vscode.pickMultipleTestProfiles',
    handler: async (accessor, options) => {
        const profileService = accessor.get(ITestProfileService);
        const quickpick = buildPicker(accessor, options);
        if (!quickpick) {
            return;
        }
        const disposables = new DisposableStore();
        disposables.add(quickpick);
        quickpick.canSelectMany = true;
        if (options.selected) {
            quickpick.selectedItems = quickpick.items
                .filter((i) => i.type === 'item')
                .filter(i => options.selected.some(s => s.controllerId === i.profile.controllerId && s.profileId === i.profile.profileId));
        }
        const pick = await new Promise(resolve => {
            disposables.add(quickpick.onDidAccept(() => {
                const selected = quickpick.selectedItems;
                resolve(selected.map(s => s.profile).filter(isDefined));
            }));
            disposables.add(quickpick.onDidHide(() => resolve(undefined)));
            disposables.add(quickpick.onDidTriggerItemButton(triggerButtonHandler(profileService, resolve)));
            quickpick.show();
        });
        disposables.dispose();
        return pick;
    }
});
CommandsRegistry.registerCommand({
    id: 'vscode.pickTestProfile',
    handler: async (accessor, options) => {
        const profileService = accessor.get(ITestProfileService);
        const quickpick = buildPicker(accessor, options);
        if (!quickpick) {
            return;
        }
        const disposables = new DisposableStore();
        disposables.add(quickpick);
        const pick = await new Promise(resolve => {
            disposables.add(quickpick.onDidAccept(() => resolve(quickpick.selectedItems[0]?.profile)));
            disposables.add(quickpick.onDidHide(() => resolve(undefined)));
            disposables.add(quickpick.onDidTriggerItemButton(triggerButtonHandler(profileService, resolve)));
            quickpick.show();
        });
        disposables.dispose();
        return pick;
    }
});
