import { CancellationToken } from '../../../../base/common/cancellation.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';
export declare const IAiRelatedInformationService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IAiRelatedInformationService>;
export declare enum RelatedInformationType {
    SymbolInformation = 1,
    CommandInformation = 2,
    SearchInformation = 3,
    SettingInformation = 4
}
interface RelatedInformationBaseResult {
    type: RelatedInformationType;
    weight: number;
}
export interface CommandInformationResult extends RelatedInformationBaseResult {
    type: RelatedInformationType.CommandInformation;
    command: string;
}
export interface SettingInformationResult extends RelatedInformationBaseResult {
    type: RelatedInformationType.SettingInformation;
    setting: string;
}
export type RelatedInformationResult = CommandInformationResult | SettingInformationResult;
export interface IAiRelatedInformationService {
    readonly _serviceBrand: undefined;
    isEnabled(): boolean;
    getRelatedInformation(query: string, types: RelatedInformationType[], token: CancellationToken): Promise<RelatedInformationResult[]>;
    registerAiRelatedInformationProvider(type: RelatedInformationType, provider: IAiRelatedInformationProvider): IDisposable;
}
export interface IAiRelatedInformationProvider {
    provideAiRelatedInformation(query: string, token: CancellationToken): Promise<RelatedInformationResult[]>;
}
export {};
