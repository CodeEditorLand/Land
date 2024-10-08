/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { ExtHostLoggerService as BaseExtHostLoggerService } from '../common/extHostLoggerService.js';
import { Schemas } from '../../../base/common/network.js';
import { SpdLogLogger } from '../../../platform/log/node/spdlogLog.js';
import { generateUuid } from '../../../base/common/uuid.js';
export class ExtHostLoggerService extends BaseExtHostLoggerService {
    doCreateLogger(resource, logLevel, options) {
        if (resource.scheme === Schemas.file) {
            /* Create the logger in the Extension Host process to prevent loggers (log, output channels...) traffic  over IPC */
            return new SpdLogLogger(options?.name || generateUuid(), resource.fsPath, !options?.donotRotate, !!options?.donotUseFormatters, logLevel);
        }
        return super.doCreateLogger(resource, logLevel, options);
    }
    registerLogger(resource) {
        super.registerLogger(resource);
        this._proxy.$registerLogger(resource);
    }
    deregisterLogger(resource) {
        super.deregisterLogger(resource);
        this._proxy.$deregisterLogger(resource);
    }
}
