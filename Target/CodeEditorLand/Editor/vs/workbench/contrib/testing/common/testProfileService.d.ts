import { Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IMainThreadTestController } from './testService.js';
import { ITestItem, ITestRunProfile, InternalTestItem, TestRunProfileBitset } from './testTypes.js';
export declare const ITestProfileService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ITestProfileService>;
export interface ITestProfileService {
    readonly _serviceBrand: undefined;
    /**
     * Fired when any profile changes.
     */
    readonly onDidChange: Event<void>;
    /**
     * Publishes a new test profile.
     */
    addProfile(controller: IMainThreadTestController, profile: ITestRunProfile): void;
    /**
     * Updates an existing test run profile
     */
    updateProfile(controllerId: string, profileId: number, update: Partial<ITestRunProfile>): void;
    /**
     * Removes a profile. If profileId is not given, all profiles
     * for the given controller will be removed.
     */
    removeProfile(controllerId: string, profileId?: number): void;
    /**
     * Gets capabilities for the given test, indicating whether
     * there's any usable profiles available for those groups.
     * @returns a bitset to use with {@link TestRunProfileBitset}
     */
    capabilitiesForTest(test: ITestItem): number;
    /**
     * Configures a test profile.
     */
    configure(controllerId: string, profileId: number): void;
    /**
     * Gets all registered controllers, grouping by controller.
     */
    all(): Iterable<Readonly<{
        controller: IMainThreadTestController;
        profiles: ITestRunProfile[];
    }>>;
    /**
     * Gets the default profiles to be run for a given run group.
     */
    getGroupDefaultProfiles(group: TestRunProfileBitset, controllerId?: string): ITestRunProfile[];
    /**
     * Sets the default profiles to be run for a given run group.
     */
    setGroupDefaultProfiles(group: TestRunProfileBitset, profiles: ITestRunProfile[]): void;
    /**
     * Gets the profiles for a controller, in priority order.
     */
    getControllerProfiles(controllerId: string): ITestRunProfile[];
    /**
     * Gets the preferred profile, if any, to run the test.
     */
    getDefaultProfileForTest(group: TestRunProfileBitset, test: InternalTestItem): ITestRunProfile | undefined;
}
/**
 * Gets whether the given profile can be used to run the test.
 */
export declare const canUseProfileWithTest: (profile: ITestRunProfile, test: InternalTestItem) => boolean;
interface IExtendedTestRunProfile extends ITestRunProfile {
    wasInitiallyDefault: boolean;
}
/**
 * Given a capabilities bitset, returns a map of context keys representing
 * them.
 */
export declare const capabilityContextKeys: (capabilities: number) => [key: string, value: boolean][];
export declare class TestProfileService extends Disposable implements ITestProfileService {
    readonly _serviceBrand: undefined;
    private readonly userDefaults;
    private readonly capabilitiesContexts;
    private readonly changeEmitter;
    private readonly controllerProfiles;
    /** @inheritdoc */
    readonly onDidChange: Event<void>;
    constructor(contextKeyService: IContextKeyService, storageService: IStorageService);
    /** @inheritdoc */
    addProfile(controller: IMainThreadTestController, profile: ITestRunProfile): void;
    /** @inheritdoc */
    updateProfile(controllerId: string, profileId: number, update: Partial<ITestRunProfile>): void;
    /** @inheritdoc */
    configure(controllerId: string, profileId: number): void;
    /** @inheritdoc */
    removeProfile(controllerId: string, profileId?: number): void;
    /** @inheritdoc */
    capabilitiesForTest(test: ITestItem): number;
    /** @inheritdoc */
    all(): MapIterator<{
        profiles: IExtendedTestRunProfile[];
        controller: IMainThreadTestController;
    }>;
    /** @inheritdoc */
    getControllerProfiles(profileId: string): IExtendedTestRunProfile[];
    /** @inheritdoc */
    getGroupDefaultProfiles(group: TestRunProfileBitset, controllerId?: string): IExtendedTestRunProfile[];
    /** @inheritdoc */
    setGroupDefaultProfiles(group: TestRunProfileBitset, profiles: ITestRunProfile[]): void;
    getDefaultProfileForTest(group: TestRunProfileBitset, test: InternalTestItem): ITestRunProfile | undefined;
    private refreshContextKeys;
}
export {};
