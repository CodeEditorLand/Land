import { Snippet } from './snippetsFile.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
export declare function pickSnippet(accessor: ServicesAccessor, languageIdOrSnippets: string | Snippet[]): Promise<Snippet | undefined>;
