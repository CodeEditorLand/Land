import { Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { InternalTestItem } from './testTypes.js';
export declare class TestExclusions extends Disposable {
    private readonly storageService;
    private readonly excluded;
    constructor(storageService: IStorageService);
    readonly onTestExclusionsChanged: Event<unknown>;
    get hasAny(): boolean;
    get all(): Iterable<string>;
    toggle(test: InternalTestItem, exclude?: boolean): void;
    contains(test: InternalTestItem): boolean;
    clear(): void;
}
