import { Disposable } from '../../../../base/common/lifecycle.js';
import { ITransaction } from '../../../../base/common/observable.js';
import { URI } from '../../../../base/common/uri.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { IExplorerFileContribution } from '../../files/browser/explorerFileContrib.js';
import { AbstractFileCoverage } from '../common/testCoverage.js';
import { ITestCoverageService } from '../common/testCoverageService.js';
export interface TestCoverageBarsOptions {
    compact: boolean;
    overall?: boolean;
    container: HTMLElement;
}
export type CoverageBarSource = Pick<AbstractFileCoverage, 'statement' | 'branch' | 'declaration'>;
export declare class ManagedTestCoverageBars extends Disposable {
    protected readonly options: TestCoverageBarsOptions;
    private readonly configurationService;
    private readonly hoverService;
    private _coverage?;
    private readonly el;
    private readonly visibleStore;
    private readonly customHovers;
    get visible(): boolean;
    constructor(options: TestCoverageBarsOptions, configurationService: IConfigurationService, hoverService: IHoverService);
    private attachHover;
    setCoverageInfo(coverage: CoverageBarSource | undefined): void;
    private doRender;
}
export declare class ExplorerTestCoverageBars extends ManagedTestCoverageBars implements IExplorerFileContribution {
    private readonly resource;
    private static hasRegistered;
    static register(): void;
    constructor(options: TestCoverageBarsOptions, configurationService: IConfigurationService, hoverService: IHoverService, testCoverageService: ITestCoverageService);
    setResource(resource: URI | undefined, transaction?: ITransaction): void;
    setCoverageInfo(coverage: AbstractFileCoverage | undefined): void;
}
