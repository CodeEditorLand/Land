import { registerSingleton } from '../../../../../platform/instantiation/common/extensions.js';
import { INotebookSearchService } from '../../common/notebookSearch.js';
import { NotebookSearchService } from './notebookSearchService.js';
export function registerContributions() {
    registerSingleton(INotebookSearchService, NotebookSearchService, 1);
}
