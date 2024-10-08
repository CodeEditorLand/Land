import './highlightDecorations.css';
import { ModelDecorationOptions } from '../../../common/model/textModel.js';
import { DocumentHighlightKind } from '../../../common/languages.js';
export declare function getHighlightDecorationOptions(kind: DocumentHighlightKind | undefined): ModelDecorationOptions;
export declare function getSelectionHighlightDecorationOptions(hasSemanticHighlights: boolean): ModelDecorationOptions;
