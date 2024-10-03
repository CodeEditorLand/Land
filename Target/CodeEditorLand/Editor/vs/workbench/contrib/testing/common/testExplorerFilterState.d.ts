import { Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IObservableValue, MutableObservableValue } from './observableValue.js';
export interface ITestExplorerFilterState {
    _serviceBrand: undefined;
    readonly text: IObservableValue<string>;
    readonly reveal: MutableObservableValue<string | undefined>;
    readonly onDidRequestInputFocus: Event<void>;
    readonly globList: readonly {
        include: boolean;
        text: string;
    }[];
    readonly includeTags: ReadonlySet<string>;
    readonly excludeTags: ReadonlySet<string>;
    readonly fuzzy: MutableObservableValue<boolean>;
    focusInput(): void;
    setText(text: string): void;
    isFilteringFor(term: TestFilterTerm): boolean;
    toggleFilteringFor(term: TestFilterTerm, shouldFilter?: boolean): void;
}
export declare const ITestExplorerFilterState: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ITestExplorerFilterState>;
export declare class TestExplorerFilterState extends Disposable implements ITestExplorerFilterState {
    private readonly storageService;
    _serviceBrand: undefined;
    private readonly focusEmitter;
    private termFilterState;
    globList: {
        include: boolean;
        text: string;
    }[];
    includeTags: Set<string>;
    excludeTags: Set<string>;
    readonly text: MutableObservableValue<string>;
    readonly fuzzy: MutableObservableValue<boolean>;
    readonly reveal: MutableObservableValue<string | undefined>;
    readonly onDidRequestInputFocus: Event<void>;
    constructor(storageService: IStorageService);
    focusInput(): void;
    setText(text: string): void;
    isFilteringFor(term: TestFilterTerm): boolean;
    toggleFilteringFor(term: TestFilterTerm, shouldFilter?: boolean): void;
}
export declare const enum TestFilterTerm {
    Failed = "@failed",
    Executed = "@executed",
    CurrentDoc = "@doc",
    OpenedFiles = "@openedFiles",
    Hidden = "@hidden"
}
