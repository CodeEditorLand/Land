import { AstNode } from './ast.js';
import { TextEditInfo } from './beforeEditPositionMapper.js';
import { Tokenizer } from './tokenizer.js';
export declare function parseDocument(tokenizer: Tokenizer, edits: TextEditInfo[], oldNode: AstNode | undefined, createImmutableLists: boolean): AstNode;
