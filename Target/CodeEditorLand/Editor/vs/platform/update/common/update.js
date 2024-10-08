/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { upcast } from '../../../base/common/types.js';
import { createDecorator } from '../../instantiation/common/instantiation.js';
export const State = {
    Uninitialized: upcast({ type: "uninitialized" /* StateType.Uninitialized */ }),
    Disabled: (reason) => ({ type: "disabled" /* StateType.Disabled */, reason }),
    Idle: (updateType, error) => ({ type: "idle" /* StateType.Idle */, updateType, error }),
    CheckingForUpdates: (explicit) => ({ type: "checking for updates" /* StateType.CheckingForUpdates */, explicit }),
    AvailableForDownload: (update) => ({ type: "available for download" /* StateType.AvailableForDownload */, update }),
    Downloading: upcast({ type: "downloading" /* StateType.Downloading */ }),
    Downloaded: (update) => ({ type: "downloaded" /* StateType.Downloaded */, update }),
    Updating: (update) => ({ type: "updating" /* StateType.Updating */, update }),
    Ready: (update) => ({ type: "ready" /* StateType.Ready */, update }),
};
export const IUpdateService = createDecorator('updateService');
