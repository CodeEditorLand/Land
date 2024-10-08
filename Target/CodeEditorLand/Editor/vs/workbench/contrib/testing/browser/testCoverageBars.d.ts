import { Disposable } from '../../../../base/common/lifecycle.js';
import { ITransaction } from '../../../../base/common/observable.js';
import { URI } from '../../../../base/common/uri.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { IExplorerFileContribution } from '../../files/browser/explorerFileContrib.js';
import { AbstractFileCoverage } from '../common/testCoverage.js';
import { ITestCoverageService } from '../common/testCoverageService.js';
export interface TestCoverageBarsOptions {
    /**
     * Whether the bars should be shown in a more compact way, where only the
     * overall bar is shown and more details are given in the hover.
     */
    compact: boolean;
    /**
     * Whether the overall stat is shown, defaults to true.
     */
    overall?: boolean;
    /**
     * Container in which is render the bars.
     */
    container: HTMLElement;
}
/** Type that can be used to render coverage bars */
export type CoverageBarSource = Pick<AbstractFileCoverage, 'statement' | 'branch' | 'declaration'>;
export declare class ManagedTestCoverageBars extends Disposable {
    protected readonly options: TestCoverageBarsOptions;
    private readonly configurationService;
    private readonly hoverService;
    private _coverage?;
    private readonly el;
    private readonly visibleStore;
    private readonly customHovers;
    /** Gets whether coverage is currently visible for the resource. */
    get visible(): boolean;
    constructor(options: TestCoverageBarsOptions, configurationService: IConfigurationService, hoverService: IHoverService);
    private attachHover;
    setCoverageInfo(coverage: CoverageBarSource | undefined): void;
    private doRender;
}
/**
 * Renders test coverage bars for a resource in the given container. It will
 * not render anything unless a test coverage report has been opened.
 */
export declare class ExplorerTestCoverageBars extends ManagedTestCoverageBars implements IExplorerFileContribution {
    private readonly resource;
    private static hasRegistered;
    static register(): void;
    constructor(options: TestCoverageBarsOptions, configurationService: IConfigurationService, hoverService: IHoverService, testCoverageService: ITestCoverageService);
    /** @inheritdoc */
    setResource(resource: URI | undefined, transaction?: ITransaction): void;
    setCoverageInfo(coverage: AbstractFileCoverage | undefined): void;
}
