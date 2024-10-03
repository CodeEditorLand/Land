import { IExtensionDescription } from '../../../../platform/extensions/common/extensions.js';
import { ILogService } from '../../../../platform/log/common/log.js';
export declare function dedupExtensions(system: IExtensionDescription[], user: IExtensionDescription[], workspace: IExtensionDescription[], development: IExtensionDescription[], logService: ILogService): IExtensionDescription[];
