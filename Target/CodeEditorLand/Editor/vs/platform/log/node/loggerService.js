import { generateUuid } from '../../../base/common/uuid.js';
import { AbstractLoggerService } from '../common/log.js';
import { SpdLogLogger } from './spdlogLog.js';
export class LoggerService extends AbstractLoggerService {
    doCreateLogger(resource, logLevel, options) {
        return new SpdLogLogger(generateUuid(), resource.fsPath, !options?.donotRotate, !!options?.donotUseFormatters, logLevel);
    }
}
