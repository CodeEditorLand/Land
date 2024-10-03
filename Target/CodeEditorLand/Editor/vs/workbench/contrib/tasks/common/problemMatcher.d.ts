import Severity from '../../../../base/common/severity.js';
import { URI } from '../../../../base/common/uri.js';
import { IJSONSchema } from '../../../../base/common/jsonSchema.js';
import { ValidationStatus, IProblemReporter, Parser } from '../../../../base/common/parsers.js';
import { IMarkerData } from '../../../../platform/markers/common/markers.js';
import { ExtensionMessageCollector } from '../../../services/extensions/common/extensionsRegistry.js';
import { Event } from '../../../../base/common/event.js';
import { IFileService } from '../../../../platform/files/common/files.js';
export declare enum FileLocationKind {
    Default = 0,
    Relative = 1,
    Absolute = 2,
    AutoDetect = 3,
    Search = 4
}
export declare namespace FileLocationKind {
    function fromString(value: string): FileLocationKind | undefined;
}
export declare enum ProblemLocationKind {
    File = 0,
    Location = 1
}
export declare namespace ProblemLocationKind {
    function fromString(value: string): ProblemLocationKind | undefined;
}
export interface IProblemPattern {
    regexp: RegExp;
    kind?: ProblemLocationKind;
    file?: number;
    message?: number;
    location?: number;
    line?: number;
    character?: number;
    endLine?: number;
    endCharacter?: number;
    code?: number;
    severity?: number;
    loop?: boolean;
}
export interface INamedProblemPattern extends IProblemPattern {
    name: string;
}
export type MultiLineProblemPattern = IProblemPattern[];
export interface IWatchingPattern {
    regexp: RegExp;
    file?: number;
}
export interface IWatchingMatcher {
    activeOnStart: boolean;
    beginsPattern: IWatchingPattern;
    endsPattern: IWatchingPattern;
}
export declare enum ApplyToKind {
    allDocuments = 0,
    openDocuments = 1,
    closedDocuments = 2
}
export declare namespace ApplyToKind {
    function fromString(value: string): ApplyToKind | undefined;
}
export interface ProblemMatcher {
    owner: string;
    source?: string;
    applyTo: ApplyToKind;
    fileLocation: FileLocationKind;
    filePrefix?: string | Config.SearchFileLocationArgs;
    pattern: IProblemPattern | IProblemPattern[];
    severity?: Severity;
    watching?: IWatchingMatcher;
    uriProvider?: (path: string) => URI;
}
export interface INamedProblemMatcher extends ProblemMatcher {
    name: string;
    label: string;
    deprecated?: boolean;
}
export interface INamedMultiLineProblemPattern {
    name: string;
    label: string;
    patterns: MultiLineProblemPattern;
}
export declare function isNamedProblemMatcher(value: ProblemMatcher | undefined): value is INamedProblemMatcher;
export interface IProblemMatch {
    resource: Promise<URI>;
    marker: IMarkerData;
    description: ProblemMatcher;
}
export interface IHandleResult {
    match: IProblemMatch | null;
    continue: boolean;
}
export declare function getResource(filename: string, matcher: ProblemMatcher, fileService?: IFileService): Promise<URI>;
export interface ILineMatcher {
    matchLength: number;
    next(line: string): IProblemMatch | null;
    handle(lines: string[], start?: number): IHandleResult;
}
export declare function createLineMatcher(matcher: ProblemMatcher, fileService?: IFileService): ILineMatcher;
export declare namespace Config {
    interface IProblemPattern {
        regexp?: string;
        kind?: string;
        file?: number;
        location?: number;
        line?: number;
        column?: number;
        endLine?: number;
        endColumn?: number;
        severity?: number;
        code?: number;
        message?: number;
        loop?: boolean;
    }
    interface ICheckedProblemPattern extends IProblemPattern {
        regexp: string;
    }
    namespace CheckedProblemPattern {
        function is(value: any): value is ICheckedProblemPattern;
    }
    interface INamedProblemPattern extends IProblemPattern {
        name: string;
        label?: string;
    }
    namespace NamedProblemPattern {
        function is(value: any): value is INamedProblemPattern;
    }
    interface INamedCheckedProblemPattern extends INamedProblemPattern {
        regexp: string;
    }
    namespace NamedCheckedProblemPattern {
        function is(value: any): value is INamedCheckedProblemPattern;
    }
    type MultiLineProblemPattern = IProblemPattern[];
    namespace MultiLineProblemPattern {
        function is(value: any): value is MultiLineProblemPattern;
    }
    type MultiLineCheckedProblemPattern = ICheckedProblemPattern[];
    namespace MultiLineCheckedProblemPattern {
        function is(value: any): value is MultiLineCheckedProblemPattern;
    }
    interface INamedMultiLineCheckedProblemPattern {
        name: string;
        label?: string;
        patterns: MultiLineCheckedProblemPattern;
    }
    namespace NamedMultiLineCheckedProblemPattern {
        function is(value: any): value is INamedMultiLineCheckedProblemPattern;
    }
    type NamedProblemPatterns = (Config.INamedProblemPattern | Config.INamedMultiLineCheckedProblemPattern)[];
    interface IWatchingPattern {
        regexp?: string;
        file?: number;
    }
    interface IBackgroundMonitor {
        activeOnStart?: boolean;
        beginsPattern?: string | IWatchingPattern;
        endsPattern?: string | IWatchingPattern;
    }
    interface ProblemMatcher {
        base?: string;
        owner?: string;
        source?: string;
        applyTo?: string;
        severity?: string;
        fileLocation?: string | string[] | ['search', SearchFileLocationArgs];
        pattern?: string | IProblemPattern | IProblemPattern[];
        watchedTaskBeginsRegExp?: string;
        watchedTaskEndsRegExp?: string;
        watching?: IBackgroundMonitor;
        background?: IBackgroundMonitor;
    }
    type SearchFileLocationArgs = {
        include?: string | string[];
        exclude?: string | string[];
    };
    type ProblemMatcherType = string | ProblemMatcher | Array<string | ProblemMatcher>;
    interface INamedProblemMatcher extends ProblemMatcher {
        name: string;
        label?: string;
    }
    function isNamedProblemMatcher(value: ProblemMatcher): value is INamedProblemMatcher;
}
export declare class ProblemPatternParser extends Parser {
    constructor(logger: IProblemReporter);
    parse(value: Config.IProblemPattern): IProblemPattern;
    parse(value: Config.MultiLineProblemPattern): MultiLineProblemPattern;
    parse(value: Config.INamedProblemPattern): INamedProblemPattern;
    parse(value: Config.INamedMultiLineCheckedProblemPattern): INamedMultiLineProblemPattern;
    private createSingleProblemPattern;
    private createNamedMultiLineProblemPattern;
    private createMultiLineProblemPattern;
    private doCreateSingleProblemPattern;
    private validateProblemPattern;
    private createRegularExpression;
}
export declare class ExtensionRegistryReporter implements IProblemReporter {
    private _collector;
    private _validationStatus;
    constructor(_collector: ExtensionMessageCollector, _validationStatus?: ValidationStatus);
    info(message: string): void;
    warn(message: string): void;
    error(message: string): void;
    fatal(message: string): void;
    get status(): ValidationStatus;
}
export declare namespace Schemas {
    const ProblemPattern: IJSONSchema;
    const NamedProblemPattern: IJSONSchema;
    const MultiLineProblemPattern: IJSONSchema;
    const NamedMultiLineProblemPattern: IJSONSchema;
    const WatchingPattern: IJSONSchema;
    const PatternType: IJSONSchema;
    const ProblemMatcher: IJSONSchema;
    const LegacyProblemMatcher: IJSONSchema;
    const NamedProblemMatcher: IJSONSchema;
}
export interface IProblemPatternRegistry {
    onReady(): Promise<void>;
    get(key: string): IProblemPattern | MultiLineProblemPattern;
}
export declare const ProblemPatternRegistry: IProblemPatternRegistry;
export declare class ProblemMatcherParser extends Parser {
    constructor(logger: IProblemReporter);
    parse(json: Config.ProblemMatcher): ProblemMatcher | undefined;
    private checkProblemMatcherValid;
    private createProblemMatcher;
    private createProblemPattern;
    private addWatchingMatcher;
    private createWatchingPattern;
    private createRegularExpression;
}
export interface IProblemMatcherRegistry {
    onReady(): Promise<void>;
    get(name: string): INamedProblemMatcher;
    keys(): string[];
    readonly onMatcherChanged: Event<void>;
}
export declare const ProblemMatcherRegistry: IProblemMatcherRegistry;
