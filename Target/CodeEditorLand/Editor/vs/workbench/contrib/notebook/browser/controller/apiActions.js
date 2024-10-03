import * as glob from '../../../../../base/common/glob.js';
import { URI } from '../../../../../base/common/uri.js';
import { CommandsRegistry } from '../../../../../platform/commands/common/commands.js';
import { isDocumentExcludePattern } from '../../common/notebookCommon.js';
import { INotebookKernelService } from '../../common/notebookKernelService.js';
import { INotebookService } from '../../common/notebookService.js';
CommandsRegistry.registerCommand('_resolveNotebookContentProvider', (accessor) => {
    const notebookService = accessor.get(INotebookService);
    const contentProviders = notebookService.getContributedNotebookTypes();
    return contentProviders.map(provider => {
        const filenamePatterns = provider.selectors.map(selector => {
            if (typeof selector === 'string') {
                return selector;
            }
            if (glob.isRelativePattern(selector)) {
                return selector;
            }
            if (isDocumentExcludePattern(selector)) {
                return {
                    include: selector.include,
                    exclude: selector.exclude
                };
            }
            return null;
        }).filter(pattern => pattern !== null);
        return {
            viewType: provider.id,
            displayName: provider.displayName,
            filenamePattern: filenamePatterns,
            options: {
                transientCellMetadata: provider.options.transientCellMetadata,
                transientDocumentMetadata: provider.options.transientDocumentMetadata,
                transientOutputs: provider.options.transientOutputs
            }
        };
    });
});
CommandsRegistry.registerCommand('_resolveNotebookKernels', async (accessor, args) => {
    const notebookKernelService = accessor.get(INotebookKernelService);
    const uri = URI.revive(args.uri);
    const kernels = notebookKernelService.getMatchingKernel({ uri, notebookType: args.viewType });
    return kernels.all.map(provider => ({
        id: provider.id,
        label: provider.label,
        description: provider.description,
        detail: provider.detail,
        isPreferred: false,
        preloads: provider.preloadUris,
    }));
});
