import { URI } from '../../../base/common/uri.js';
import { IV8Profile } from '../common/profiling.js';
import { BottomUpSample } from '../common/profilingModel.js';
export declare const enum ProfilingOutput {
    Failure = 0,
    Irrelevant = 1,
    Interesting = 2
}
export interface IScriptUrlClassifier {
    (scriptUrl: string): string;
}
export declare const IProfileAnalysisWorkerService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IProfileAnalysisWorkerService>;
export interface IProfileAnalysisWorkerService {
    readonly _serviceBrand: undefined;
    analyseBottomUp(profile: IV8Profile, callFrameClassifier: IScriptUrlClassifier, perfBaseline: number, sendAsErrorTelemtry: boolean): Promise<ProfilingOutput>;
    analyseByLocation(profile: IV8Profile, locations: [location: URI, id: string][]): Promise<[category: string, aggregated: number][]>;
}
export interface BottomUpAnalysis {
    kind: ProfilingOutput;
    samples: BottomUpSample[];
}
export interface CategoryAnalysis {
    category: string;
    percentage: number;
    aggregated: number;
    overallDuration: number;
}
export interface IProfileAnalysisWorker {
    $analyseBottomUp(profile: IV8Profile): BottomUpAnalysis;
    $analyseByUrlCategory(profile: IV8Profile, categories: [url: URI, category: string][]): [category: string, aggregated: number][];
}
