import { Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { InternalTestItem } from './testTypes.js';
export declare class TestExclusions extends Disposable {
    private readonly storageService;
    private readonly excluded;
    constructor(storageService: IStorageService);
    /**
     * Event that fires when the excluded tests change.
     */
    readonly onTestExclusionsChanged: Event<unknown>;
    /**
     * Gets whether there's any excluded tests.
     */
    get hasAny(): boolean;
    /**
     * Gets all excluded tests.
     */
    get all(): Iterable<string>;
    /**
     * Sets whether a test is excluded.
     */
    toggle(test: InternalTestItem, exclude?: boolean): void;
    /**
     * Gets whether a test is excluded.
     */
    contains(test: InternalTestItem): boolean;
    /**
     * Removes all test exclusions.
     */
    clear(): void;
}
