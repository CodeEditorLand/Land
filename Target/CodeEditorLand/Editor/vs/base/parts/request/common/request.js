/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const offlineName = 'Offline';
/**
 * Checks if the given error is offline error
 */
export function isOfflineError(error) {
    if (error instanceof OfflineError) {
        return true;
    }
    return error instanceof Error && error.name === offlineName && error.message === offlineName;
}
export class OfflineError extends Error {
    constructor() {
        super(offlineName);
        this.name = this.message;
    }
}
