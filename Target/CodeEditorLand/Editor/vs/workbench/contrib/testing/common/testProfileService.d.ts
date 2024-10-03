import { Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IMainThreadTestController } from './testService.js';
import { ITestItem, ITestRunProfile, InternalTestItem, TestRunProfileBitset } from './testTypes.js';
export declare const ITestProfileService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ITestProfileService>;
export interface ITestProfileService {
    readonly _serviceBrand: undefined;
    readonly onDidChange: Event<void>;
    addProfile(controller: IMainThreadTestController, profile: ITestRunProfile): void;
    updateProfile(controllerId: string, profileId: number, update: Partial<ITestRunProfile>): void;
    removeProfile(controllerId: string, profileId?: number): void;
    capabilitiesForTest(test: ITestItem): number;
    configure(controllerId: string, profileId: number): void;
    all(): Iterable<Readonly<{
        controller: IMainThreadTestController;
        profiles: ITestRunProfile[];
    }>>;
    getGroupDefaultProfiles(group: TestRunProfileBitset, controllerId?: string): ITestRunProfile[];
    setGroupDefaultProfiles(group: TestRunProfileBitset, profiles: ITestRunProfile[]): void;
    getControllerProfiles(controllerId: string): ITestRunProfile[];
}
export declare const canUseProfileWithTest: (profile: ITestRunProfile, test: InternalTestItem) => boolean;
interface IExtendedTestRunProfile extends ITestRunProfile {
    wasInitiallyDefault: boolean;
}
export declare const capabilityContextKeys: (capabilities: number) => [key: string, value: boolean][];
export declare class TestProfileService extends Disposable implements ITestProfileService {
    readonly _serviceBrand: undefined;
    private readonly userDefaults;
    private readonly capabilitiesContexts;
    private readonly changeEmitter;
    private readonly controllerProfiles;
    readonly onDidChange: Event<void>;
    constructor(contextKeyService: IContextKeyService, storageService: IStorageService);
    addProfile(controller: IMainThreadTestController, profile: ITestRunProfile): void;
    updateProfile(controllerId: string, profileId: number, update: Partial<ITestRunProfile>): void;
    configure(controllerId: string, profileId: number): void;
    removeProfile(controllerId: string, profileId?: number): void;
    capabilitiesForTest(test: ITestItem): number;
    all(): MapIterator<{
        profiles: IExtendedTestRunProfile[];
        controller: IMainThreadTestController;
    }>;
    getControllerProfiles(profileId: string): IExtendedTestRunProfile[];
    getGroupDefaultProfiles(group: TestRunProfileBitset, controllerId?: string): IExtendedTestRunProfile[];
    setGroupDefaultProfiles(group: TestRunProfileBitset, profiles: ITestRunProfile[]): void;
    private refreshContextKeys;
}
export {};
