import { IIntegrityService, IntegrityTestResult } from '../common/integrity.js';
import { ILifecycleService } from '../../lifecycle/common/lifecycle.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IChecksumService } from '../../../../platform/checksum/common/checksumService.js';
import { ILogService } from '../../../../platform/log/common/log.js';
export declare class IntegrityService implements IIntegrityService {
    private readonly notificationService;
    private readonly storageService;
    private readonly lifecycleService;
    private readonly openerService;
    private readonly productService;
    private readonly checksumService;
    private readonly logService;
    readonly _serviceBrand: undefined;
    private readonly _storage;
    private readonly _isPurePromise;
    isPure(): Promise<IntegrityTestResult>;
    constructor(notificationService: INotificationService, storageService: IStorageService, lifecycleService: ILifecycleService, openerService: IOpenerService, productService: IProductService, checksumService: IChecksumService, logService: ILogService);
    private _compute;
    private _isPure;
    private _resolve;
    private static _createChecksumPair;
    private _showNotification;
}
