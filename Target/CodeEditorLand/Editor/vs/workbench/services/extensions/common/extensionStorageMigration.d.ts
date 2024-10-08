import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
/**
 * An extension storage has following
 * 	- State: Stored using storage service with extension id as key and state as value.
 *  - Resources: Stored under a location scoped to the extension.
 */
export declare function migrateExtensionStorage(fromExtensionId: string, toExtensionId: string, global: boolean, instantionService: IInstantiationService): Promise<void>;
