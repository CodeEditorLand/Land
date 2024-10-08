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
        /**
        * The regular expression to find a problem in the console output of an
        * executed task.
        */
        regexp?: string;
        /**
        * Whether the pattern matches a whole file, or a location (file/line)
        *
        * The default is to match for a location. Only valid on the
        * first problem pattern in a multi line problem matcher.
        */
        kind?: string;
        /**
        * The match group index of the filename.
        * If omitted 1 is used.
        */
        file?: number;
        /**
        * The match group index of the problem's location. Valid location
        * patterns are: (line), (line,column) and (startLine,startColumn,endLine,endColumn).
        * If omitted the line and column properties are used.
        */
        location?: number;
        /**
        * The match group index of the problem's line in the source file.
        *
        * Defaults to 2.
        */
        line?: number;
        /**
        * The match group index of the problem's column in the source file.
        *
        * Defaults to 3.
        */
        column?: number;
        /**
        * The match group index of the problem's end line in the source file.
        *
        * Defaults to undefined. No end line is captured.
        */
        endLine?: number;
        /**
        * The match group index of the problem's end column in the source file.
        *
        * Defaults to undefined. No end column is captured.
        */
        endColumn?: number;
        /**
        * The match group index of the problem's severity.
        *
        * Defaults to undefined. In this case the problem matcher's severity
        * is used.
        */
        severity?: number;
        /**
        * The match group index of the problem's code.
        *
        * Defaults to undefined. No code is captured.
        */
        code?: number;
        /**
        * The match group index of the message. If omitted it defaults
        * to 4 if location is specified. Otherwise it defaults to 5.
        */
        message?: number;
        /**
        * Specifies if the last pattern in a multi line problem matcher should
        * loop as long as it does match a line consequently. Only valid on the
        * last problem pattern in a multi line problem matcher.
        */
        loop?: boolean;
    }
    interface ICheckedProblemPattern extends IProblemPattern {
        /**
        * The regular expression to find a problem in the console output of an
        * executed task.
        */
        regexp: string;
    }
    namespace CheckedProblemPattern {
        function is(value: any): value is ICheckedProblemPattern;
    }
    interface INamedProblemPattern extends IProblemPattern {
        /**
         * The name of the problem pattern.
         */
        name: string;
        /**
         * A human readable label
         */
        label?: string;
    }
    namespace NamedProblemPattern {
        function is(value: any): value is INamedProblemPattern;
    }
    interface INamedCheckedProblemPattern extends INamedProblemPattern {
        /**
        * The regular expression to find a problem in the console output of an
        * executed task.
        */
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
        /**
         * The name of the problem pattern.
         */
        name: string;
        /**
         * A human readable label
         */
        label?: string;
        /**
         * The actual patterns
         */
        patterns: MultiLineCheckedProblemPattern;
    }
    namespace NamedMultiLineCheckedProblemPattern {
        function is(value: any): value is INamedMultiLineCheckedProblemPattern;
    }
    type NamedProblemPatterns = (Config.INamedProblemPattern | Config.INamedMultiLineCheckedProblemPattern)[];
    /**
    * A watching pattern
    */
    interface IWatchingPattern {
        /**
        * The actual regular expression
        */
        regexp?: string;
        /**
        * The match group index of the filename. If provided the expression
        * is matched for that file only.
        */
        file?: number;
    }
    /**
    * A description to track the start and end of a watching task.
    */
    interface IBackgroundMonitor {
        /**
        * If set to true the watcher is in active mode when the task
        * starts. This is equals of issuing a line that matches the
        * beginsPattern.
        */
        activeOnStart?: boolean;
        /**
        * If matched in the output the start of a watching task is signaled.
        */
        beginsPattern?: string | IWatchingPattern;
        /**
        * If matched in the output the end of a watching task is signaled.
        */
        endsPattern?: string | IWatchingPattern;
    }
    /**
    * A description of a problem matcher that detects problems
    * in build output.
    */
    interface ProblemMatcher {
        /**
         * The name of a base problem matcher to use. If specified the
         * base problem matcher will be used as a template and properties
         * specified here will replace properties of the base problem
         * matcher
         */
        base?: string;
        /**
         * The owner of the produced VSCode problem. This is typically
         * the identifier of a VSCode language service if the problems are
         * to be merged with the one produced by the language service
         * or a generated internal id. Defaults to the generated internal id.
         */
        owner?: string;
        /**
         * A human-readable string describing the source of this problem.
         * E.g. 'typescript' or 'super lint'.
         */
        source?: string;
        /**
        * Specifies to which kind of documents the problems found by this
        * matcher are applied. Valid values are:
        *
        *   "allDocuments": problems found in all documents are applied.
        *   "openDocuments": problems found in documents that are open
        *   are applied.
        *   "closedDocuments": problems found in closed documents are
        *   applied.
        */
        applyTo?: string;
        /**
        * The severity of the VSCode problem produced by this problem matcher.
        *
        * Valid values are:
        *   "error": to produce errors.
        *   "warning": to produce warnings.
        *   "info": to produce infos.
        *
        * The value is used if a pattern doesn't specify a severity match group.
        * Defaults to "error" if omitted.
        */
        severity?: string;
        /**
        * Defines how filename reported in a problem pattern
        * should be read. Valid values are:
        *  - "absolute": the filename is always treated absolute.
        *  - "relative": the filename is always treated relative to
        *    the current working directory. This is the default.
        *  - ["relative", "path value"]: the filename is always
        *    treated relative to the given path value.
        *  - "autodetect": the filename is treated relative to
        *    the current workspace directory, and if the file
        *    does not exist, it is treated as absolute.
        *  - ["autodetect", "path value"]: the filename is treated
        *    relative to the given path value, and if it does not
        *    exist, it is treated as absolute.
        *  - ["search", { include?: "" | []; exclude?: "" | [] }]: The filename
        *    needs to be searched under the directories named by the "include"
        *    property and their nested subdirectories. With "exclude" property
        *    present, the directories should be removed from the search. When
        *    `include` is not unprovided, the current workspace directory should
        *    be used as the default.
        */
        fileLocation?: string | string[] | ['search', SearchFileLocationArgs];
        /**
        * The name of a predefined problem pattern, the inline definition
        * of a problem pattern or an array of problem patterns to match
        * problems spread over multiple lines.
        */
        pattern?: string | IProblemPattern | IProblemPattern[];
        /**
        * A regular expression signaling that a watched tasks begins executing
        * triggered through file watching.
        */
        watchedTaskBeginsRegExp?: string;
        /**
        * A regular expression signaling that a watched tasks ends executing.
        */
        watchedTaskEndsRegExp?: string;
        /**
         * @deprecated Use background instead.
         */
        watching?: IBackgroundMonitor;
        background?: IBackgroundMonitor;
    }
    type SearchFileLocationArgs = {
        include?: string | string[];
        exclude?: string | string[];
    };
    type ProblemMatcherType = string | ProblemMatcher | Array<string | ProblemMatcher>;
    interface INamedProblemMatcher extends ProblemMatcher {
        /**
        * This name can be used to refer to the
        * problem matcher from within a task.
        */
        name: string;
        /**
         * A human readable label.
         */
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
