/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as resources from '../../../../base/common/resources.js';
import { URI } from '../../../../base/common/uri.js';
import { CancellationTokenSource } from '../../../../base/common/cancellation.js';
import * as errors from '../../../../base/common/errors.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { QueryBuilder } from '../../search/common/queryBuilder.js';
import { ISearchService } from '../../search/common/search.js';
import { toWorkspaceFolder } from '../../../../platform/workspace/common/workspace.js';
import { promiseWithResolvers } from '../../../../base/common/async.js';
const WORKSPACE_CONTAINS_TIMEOUT = 7000;
export function checkActivateWorkspaceContainsExtension(host, desc) {
    const activationEvents = desc.activationEvents;
    if (!activationEvents) {
        return Promise.resolve(undefined);
    }
    const fileNames = [];
    const globPatterns = [];
    for (const activationEvent of activationEvents) {
        if (/^workspaceContains:/.test(activationEvent)) {
            const fileNameOrGlob = activationEvent.substr('workspaceContains:'.length);
            if (fileNameOrGlob.indexOf('*') >= 0 || fileNameOrGlob.indexOf('?') >= 0 || host.forceUsingSearch) {
                globPatterns.push(fileNameOrGlob);
            }
            else {
                fileNames.push(fileNameOrGlob);
            }
        }
    }
    if (fileNames.length === 0 && globPatterns.length === 0) {
        return Promise.resolve(undefined);
    }
    const { promise, resolve } = promiseWithResolvers();
    const activate = (activationEvent) => resolve({ activationEvent });
    const fileNamePromise = Promise.all(fileNames.map((fileName) => _activateIfFileName(host, fileName, activate))).then(() => { });
    const globPatternPromise = _activateIfGlobPatterns(host, desc.identifier, globPatterns, activate);
    Promise.all([fileNamePromise, globPatternPromise]).then(() => {
        // when all are done, resolve with undefined (relevant only if it was not activated so far)
        resolve(undefined);
    });
    return promise;
}
async function _activateIfFileName(host, fileName, activate) {
    // find exact path
    for (const uri of host.folders) {
        if (await host.exists(resources.joinPath(URI.revive(uri), fileName))) {
            // the file was found
            activate(`workspaceContains:${fileName}`);
            return;
        }
    }
}
async function _activateIfGlobPatterns(host, extensionId, globPatterns, activate) {
    if (globPatterns.length === 0) {
        return Promise.resolve(undefined);
    }
    const tokenSource = new CancellationTokenSource();
    const searchP = host.checkExists(host.folders, globPatterns, tokenSource.token);
    const timer = setTimeout(async () => {
        tokenSource.cancel();
        host.logService.info(`Not activating extension '${extensionId.value}': Timed out while searching for 'workspaceContains' pattern ${globPatterns.join(',')}`);
    }, WORKSPACE_CONTAINS_TIMEOUT);
    let exists = false;
    try {
        exists = await searchP;
    }
    catch (err) {
        if (!errors.isCancellationError(err)) {
            errors.onUnexpectedError(err);
        }
    }
    tokenSource.dispose();
    clearTimeout(timer);
    if (exists) {
        // a file was found matching one of the glob patterns
        activate(`workspaceContains:${globPatterns.join(',')}`);
    }
}
export function checkGlobFileExists(accessor, folders, includes, token) {
    const instantiationService = accessor.get(IInstantiationService);
    const searchService = accessor.get(ISearchService);
    const queryBuilder = instantiationService.createInstance(QueryBuilder);
    const query = queryBuilder.file(folders.map(folder => toWorkspaceFolder(URI.revive(folder))), {
        _reason: 'checkExists',
        includePattern: includes,
        exists: true
    });
    return searchService.fileSearch(query, token).then(result => {
        return !!result.limitHit;
    }, err => {
        if (!errors.isCancellationError(err)) {
            return Promise.reject(err);
        }
        return false;
    });
}
