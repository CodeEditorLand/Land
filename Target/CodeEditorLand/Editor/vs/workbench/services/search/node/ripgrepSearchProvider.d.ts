import { CancellationToken } from '../../../../base/common/cancellation.js';
import { OutputChannel } from './ripgrepSearchUtils.js';
import { TextSearchProviderNew, TextSearchCompleteNew, TextSearchResultNew, TextSearchQueryNew, TextSearchProviderOptions } from '../common/searchExtTypes.js';
import { Progress } from '../../../../platform/progress/common/progress.js';
export declare class RipgrepSearchProvider implements TextSearchProviderNew {
    private outputChannel;
    private getNumThreads;
    private inProgress;
    constructor(outputChannel: OutputChannel, getNumThreads: () => Promise<number | undefined>);
    provideTextSearchResults(query: TextSearchQueryNew, options: TextSearchProviderOptions, progress: Progress<TextSearchResultNew>, token: CancellationToken): Promise<TextSearchCompleteNew>;
    private withToken;
    private dispose;
}
