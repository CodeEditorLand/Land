import { AstNode } from './ast.js';
import { TextEditInfo } from './beforeEditPositionMapper.js';
import { Tokenizer } from './tokenizer.js';
/**
 * Non incrementally built ASTs are immutable.
*/
export declare function parseDocument(tokenizer: Tokenizer, edits: TextEditInfo[], oldNode: AstNode | undefined, createImmutableLists: boolean): AstNode;
